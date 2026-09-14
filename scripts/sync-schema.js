const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// NEVER run or write files in Vercel or production builds
if (process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.CI) {
  process.exit(0);
}

// Load environment variables manually without dependencies
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.replace(/\r/g, '').split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          if (!process.env[key]) process.env[key] = val;
        }
      });
    }
  } catch (e) {
    console.warn('Could not load .env.local', e.message);
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const SCHEMA_DIR = path.join(process.cwd(), 'supabase');
const TYPES_DIR = path.join(process.cwd(), 'src', 'types');
const HASH_FILE = path.join(SCHEMA_DIR, '.schema_hash');
const TS_FILE = path.join(TYPES_DIR, 'database.types.ts');
const SQL_FILE = path.join(SCHEMA_DIR, 'schema.sql');
const MD_FILE = path.join(SCHEMA_DIR, 'SCHEMA.md');

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isStrict = args.includes('--strict');
const intervalArg = args.find(a => a.startsWith('--interval='));
const intervalSeconds = intervalArg ? parseInt(intervalArg.split('=')[1], 10) : 15;

function ensureDirs() {
  if (!fs.existsSync(SCHEMA_DIR)) fs.mkdirSync(SCHEMA_DIR, { recursive: true });
  if (!fs.existsSync(TYPES_DIR)) fs.mkdirSync(TYPES_DIR, { recursive: true });
}

async function fetchSchema() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables.');
  }

  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/`;
  
  const res = await fetch(endpoint, {
    headers: {
      'Accept': 'application/openapi+json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch schema: ${res.status} ${res.statusText} - ${errText}`);
  }

  const text = await res.text();
  return text;
}

function computeHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function mapToTsType(type, format) {
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'string') {
    if (format === 'timestamp with time zone' || format === 'timestamp without time zone' || format === 'date') return 'string';
    if (format === 'uuid') return 'string';
    return 'string';
  }
  if (type === 'array') return 'any[]';
  return 'any'; // json, jsonb, etc
}

function mapToSqlType(type, format) {
  if (format) return format;
  if (type === 'integer') return 'integer';
  if (type === 'number') return 'numeric';
  if (type === 'boolean') return 'boolean';
  if (type === 'string') return 'text';
  if (type === 'array') return 'jsonb'; // Fallback
  return 'jsonb';
}

function generateTypescript(definitions) {
  let ts = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
`;

  for (const [tableName, def] of Object.entries(definitions)) {
    ts += `      ${tableName}: {\n`;
    ts += `        Row: {\n`;
    for (const [colName, colDef] of Object.entries(def.properties || {})) {
      const isNullable = !def.required?.includes(colName);
      const tsType = mapToTsType(colDef.type, colDef.format);
      ts += `          ${colName}: ${tsType}${isNullable ? ' | null' : ''}\n`;
    }
    ts += `        }\n`;
    ts += `        Insert: {\n`;
    for (const [colName, colDef] of Object.entries(def.properties || {})) {
      const isRequired = def.required?.includes(colName) && !colDef.default;
      const tsType = mapToTsType(colDef.type, colDef.format);
      ts += `          ${colName}${isRequired ? '' : '?'}: ${tsType}${isRequired ? '' : ' | null'}\n`;
    }
    ts += `        }\n`;
    ts += `        Update: {\n`;
    for (const [colName, colDef] of Object.entries(def.properties || {})) {
      const tsType = mapToTsType(colDef.type, colDef.format);
      ts += `          ${colName}?: ${tsType} | null\n`;
    }
    ts += `        }\n`;
    ts += `      }\n`;
  }

  ts += `    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
`;
  return ts;
}

function parseConstraints(colDef) {
  const desc = colDef.description || '';
  const pk = desc.includes('<pk/>');
  
  // Extract foreign keys: <fk table='profiles' column='id'/> or Foreign Key to 'profiles.id'
  let fkTable = null;
  let fkColumn = null;
  
  const fkMatch1 = desc.match(/<fk table='([^']+)' column='([^']+)'\/>/);
  if (fkMatch1) {
    fkTable = fkMatch1[1];
    fkColumn = fkMatch1[2];
  } else {
    const fkMatch2 = desc.match(/Foreign Key to '([^']+)\.([^']+)'/i);
    if (fkMatch2) {
      fkTable = fkMatch2[1];
      fkColumn = fkMatch2[2];
    }
  }

  return { pk, fkTable, fkColumn };
}

function generateSql(definitions) {
  let sql = `-- Auto-generated SQL schema from Supabase OpenAPI endpoint\n\n`;

  for (const [tableName, def] of Object.entries(definitions)) {
    sql += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
    const cols = [];
    
    for (const [colName, colDef] of Object.entries(def.properties || {})) {
      const isNullable = !def.required?.includes(colName);
      const sqlType = mapToSqlType(colDef.type, colDef.format);
      const { pk, fkTable, fkColumn } = parseConstraints(colDef);
      
      let colSql = `  ${colName} ${sqlType}`;
      if (!isNullable) colSql += ` NOT NULL`;
      if (colDef.default) {
        let defVal = colDef.default;
        if (typeof defVal === 'string' && !defVal.includes('(') && !defVal.includes('::')) {
          defVal = `'${defVal}'`;
        }
        colSql += ` DEFAULT ${defVal}`;
      }
      if (pk) colSql += ` PRIMARY KEY`;
      if (fkTable && fkColumn) colSql += ` REFERENCES public.${fkTable}(${fkColumn})`;
      
      cols.push(colSql);
    }
    sql += cols.join(',\n');
    sql += `\n);\n\n`;
  }
  return sql;
}

function generateMarkdown(definitions, openApi) {
  let md = `# Database Schema\n\n`;
  md += `**Generated At:** ${new Date().toUTCString()}\n\n`;

  // ER Diagram
  md += `## ER Diagram\n\n`;
  md += `\`\`\`mermaid\n`;
  md += `erDiagram\n`;
  
  for (const [tableName, def] of Object.entries(definitions)) {
    md += `  ${tableName} {\n`;
    for (const [colName, colDef] of Object.entries(def.properties || {})) {
      const type = mapToSqlType(colDef.type, colDef.format).split(' ')[0];
      const { pk, fkTable } = parseConstraints(colDef);
      const marker = pk ? 'PK' : (fkTable ? 'FK' : '');
      md += `    ${type} ${colName} ${marker}\n`;
    }
    md += `  }\n`;
  }

  md += `\n`;
  for (const [tableName, def] of Object.entries(definitions)) {
    for (const [colName, colDef] of Object.entries(def.properties || {})) {
      const { fkTable } = parseConstraints(colDef);
      if (fkTable) {
        md += `  ${tableName} }|--|| ${fkTable} : "${colName}"\n`;
      }
    }
  }
  md += `\`\`\`\n\n`;

  // Tables
  md += `## Tables\n\n`;
  for (const [tableName, def] of Object.entries(definitions)) {
    md += `### \`${tableName}\`\n\n`;
    if (def.description) md += `${def.description}\n\n`;
    
    md += `| Column | Type | Nullable | Default | Constraints |\n`;
    md += `|---|---|---|---|---|\n`;
    
    for (const [colName, colDef] of Object.entries(def.properties || {})) {
      const type = mapToSqlType(colDef.type, colDef.format);
      const isNullable = !def.required?.includes(colName);
      const { pk, fkTable, fkColumn } = parseConstraints(colDef);
      
      let constraints = [];
      if (pk) constraints.push('Primary Key');
      if (fkTable) constraints.push(`FK -> ${fkTable}.${fkColumn}`);
      
      md += `| \`${colName}\` | \`${type}\` | ${isNullable} | \`${colDef.default || ''}\` | ${constraints.join(', ')} |\n`;
    }
    md += `\n`;
  }

  return md;
}

async function runSync() {
  try {
    const rawData = await fetchSchema();
    const hash = computeHash(rawData);

    ensureDirs();

    let oldHash = '';
    if (fs.existsSync(HASH_FILE)) {
      oldHash = fs.readFileSync(HASH_FILE, 'utf8').trim();
    }

    if (hash === oldHash) {
      // Schema hasn't changed. Stay quiet.
      return true;
    }

    console.log('[schema-sync] Database schema change detected. Updating artifacts...');
    
    const openApi = JSON.parse(rawData);
    const definitions = openApi.definitions || {};

    // 1. TS
    const tsContent = generateTypescript(definitions);
    fs.writeFileSync(TS_FILE, tsContent);
    console.log(`[schema-sync] Wrote ${TS_FILE}`);

    // 2. SQL
    const sqlContent = generateSql(definitions);
    fs.writeFileSync(SQL_FILE, sqlContent);
    console.log(`[schema-sync] Wrote ${SQL_FILE}`);

    // 3. Markdown
    const mdContent = generateMarkdown(definitions, openApi);
    fs.writeFileSync(MD_FILE, mdContent);
    console.log(`[schema-sync] Wrote ${MD_FILE}`);

    // Update hash
    fs.writeFileSync(HASH_FILE, hash);
    console.log('[schema-sync] Sync complete.');
    return true;

  } catch (err) {
    if (err.message && (err.message.includes('service_role') || err.message.includes('401'))) {
      console.warn('[schema-sync] Note: Live Supabase introspection requires SUPABASE_SERVICE_ROLE_KEY in .env.local.');
      console.warn('[schema-sync] Normal app features use the public anon key. Schema sync skipped until service_role key is added.');
      return false;
    }
    console.error('[schema-sync] Error:', err.message);
    if (isStrict) process.exit(1);
    return false;
  }
}

async function start() {
  const ok = await runSync();
  
  if (isWatch && ok) {
    console.log(`[schema-sync] Watching for changes every ${intervalSeconds} seconds...`);
    setInterval(runSync, intervalSeconds * 1000);
  }
}

start();

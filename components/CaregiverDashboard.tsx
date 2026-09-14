'use client'

import { useMemo, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { SessionResult } from './GameScreen'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** One completed game session: a timestamp plus every round's result. */
export interface GameSession {
  id: string
  /** ISO timestamp of when the session finished */
  completedAt: string
  results: SessionResult[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Note: demo/mock session data lives in page.tsx (DEMO_SESSIONS) and is
// injected via the liveSessions prop. The dashboard is a pure display component.
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100)
}

function avg(nums: number[]) {
  return nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  icon: string
  accent: string   // CSS color
  bg: string       // CSS color
  trend?: 'up' | 'down' | 'neutral'
}

function MetricCard({ label, value, sub, icon, accent, bg, trend }: MetricCardProps) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'
  const trendColor =
    trend === 'up' ? 'var(--color-accessible-green)' :
    trend === 'down' ? 'var(--color-accessible-red)' :
    'var(--color-content-muted)'

  return (
    <div
      className="card-accessible flex flex-col gap-3"
      role="region"
      aria-label={label}
      style={{ borderColor: accent }}
    >
      {/* Icon badge */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
        aria-hidden="true"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </div>

      {/* Value */}
      <p
        className="font-extrabold leading-none"
        style={{ fontSize: 'var(--font-size-accessible-2xl)', color: accent }}
      >
        {value}
      </p>

      {/* Label + trend */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p
          className="font-semibold"
          style={{ fontSize: 'var(--font-size-accessible-sm)', color: 'var(--color-content-secondary)' }}
        >
          {label}
        </p>
        {trend && (
          <span
            className="text-sm font-bold"
            style={{ color: trendColor }}
            aria-label={`Trend: ${trend}`}
          >
            {trendIcon}
          </span>
        )}
      </div>

      {sub && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-content-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Trend chart — simple inline bar chart per session
// ─────────────────────────────────────────────────────────────────────────────

interface TrendChartProps {
  sessions: GameSession[]
}

function TrendChart({ sessions }: TrendChartProps) {
  // Per session: accuracy % and avg reaction time (normalised to 0–100)
  const MAX_RT = 10_000 // treat 10 s as the slowest expected

  const bars = sessions.map((s) => {
    const total   = s.results.length
    const correct = s.results.filter((r) => r.isCorrect).length
    const accPct  = pct(correct, total)
    const rtAvg   = avg(s.results.map((r) => r.reactionTimeMs))
    // Invert: lower reaction time → higher motor bar
    const motorPct = Math.round(Math.max(0, (1 - rtAvg / MAX_RT) * 100))

    return { label: formatDate(s.completedAt), accPct, motorPct }
  })

  return (
    <div
      className="card-accessible"
      role="region"
      aria-label="Cognitive and motor performance trend"
    >
      <h2
        className="font-bold mb-1"
        style={{ fontSize: 'var(--font-size-accessible-lg)', color: 'var(--color-content-primary)' }}
      >
        Performance Trends
      </h2>
      <p style={{ fontSize: 'var(--font-size-accessible-sm)', color: 'var(--color-content-muted)', marginBottom: '1.5rem' }}>
        Cognitive accuracy vs. motor response speed — last {sessions.length} sessions
      </p>

      {/* Legend */}
      <div className="flex gap-6 mb-4 flex-wrap">
        {[
          { color: '#6F8F7A', label: 'Cognitive accuracy %' },
          { color: '#D9A441', label: 'Motor speed score' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} aria-hidden="true" />
            <span style={{ fontSize: '0.875rem', color: 'var(--color-content-secondary)', fontWeight: 600 }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Bar groups */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${bars.length}, 1fr)` }}
        role="list"
        aria-label="Session bar chart"
      >
        {bars.map((b, i) => (
          <div key={i} className="flex flex-col items-center gap-2" role="listitem" aria-label={`Session ${i + 1}: ${b.label}`}>
            {/* Dual bar */}
            <div className="w-full flex gap-1 items-end" style={{ height: '120px' }}>
              {/* Cognitive bar */}
              <div className="flex-1 rounded-t-lg flex items-end justify-center relative"
                style={{ height: '100%', backgroundColor: '#F1F5F9' }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${b.accPct}%`,
                    backgroundColor: '#6F8F7A',
                    minHeight: '4px',
                  }}
                  title={`Accuracy: ${b.accPct}%`}
                />
              </div>
              {/* Motor bar */}
              <div className="flex-1 rounded-t-lg flex items-end justify-center"
                style={{ height: '100%', backgroundColor: '#F1F5F9' }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${b.motorPct}%`,
                    backgroundColor: '#D9A441',
                    minHeight: '4px',
                  }}
                  title={`Motor score: ${b.motorPct}`}
                />
              </div>
            </div>

            {/* Percentage labels */}
            <div className="flex gap-1 w-full justify-center text-center">
              <span style={{ fontSize: '0.7rem', color: '#6F8F7A', fontWeight: 700, flex: 1 }}>
                {b.accPct}%
              </span>
              <span style={{ fontSize: '0.7rem', color: '#D9A441', fontWeight: 700, flex: 1 }}>
                {b.motorPct}
              </span>
            </div>

            {/* Date label */}
            <span
              className="text-center leading-tight"
              style={{ fontSize: '0.7rem', color: 'var(--color-content-muted)', fontWeight: 600 }}
            >
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Clinical Insights card
// ─────────────────────────────────────────────────────────────────────────────

interface InsightBadgeProps { type: 'positive' | 'warning' | 'info'; text: string }

function InsightBadge({ type, text }: InsightBadgeProps) {
  const styles: Record<InsightBadgeProps['type'], { bg: string; border: string; icon: string; color: string }> = {
    positive: { bg: '#DCFCE7', border: '#86EFAC', icon: '✅', color: 'var(--color-accessible-green)' },
    warning:  { bg: '#FEF9C3', border: '#FDE047', icon: '⚠️',  color: '#854D0E' },
    info:     { bg: '#E8EFEA', border: '#B5CEBF', icon: '💡',  color: '#3D5245' },
  }
  const s = styles[type]

  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-3"
      style={{ backgroundColor: s.bg, border: `2px solid ${s.border}` }}
      role="listitem"
    >
      <span className="text-xl mt-0.5" aria-hidden="true">{s.icon}</span>
      <p style={{ fontSize: 'var(--font-size-accessible-sm)', color: s.color, fontWeight: 600, lineHeight: '1.6' }}>
        {text}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dashboard component
// ─────────────────────────────────────────────────────────────────────────────

interface CaregiverDashboardProps {
  /**
   * Live sessions passed in from the parent page (e.g., after each game
   * completion). Merged with the pre-loaded mock history for demo purposes.
   */
  liveSessions?: GameSession[]
}

export default function CaregiverDashboard({ liveSessions = [] }: CaregiverDashboardProps) {
  const [exportState, setExportState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [activeTab, setActiveTab] = useState<'overview' | 'stats'>('overview')

  // Sort all injected sessions newest-first (demo data + any live completions)
  const allSessions: GameSession[] = useMemo(
    () => [...liveSessions].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    ),
    [liveSessions],
  )

  // ── Aggregate metrics ───────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const allResults = allSessions.flatMap((s) => s.results)
    const totalRounds  = allResults.length
    const totalCorrect = allResults.filter((r) => r.isCorrect).length
    const accuracy     = pct(totalCorrect, totalRounds)
    const avgRT        = avg(allResults.map((r) => r.reactionTimeMs))
    const avgRTSec     = (avgRT / 1000).toFixed(1)

    // Trend: compare first half vs second half of sessions (chronological)
    const asc         = [...allSessions].reverse()
    const mid         = Math.floor(asc.length / 2)
    const earlyAcc    = asc.slice(0, mid).flatMap((s) => s.results)
    const recentAcc   = asc.slice(mid).flatMap((s) => s.results)
    const earlyPct    = pct(earlyAcc.filter((r) => r.isCorrect).length, earlyAcc.length)
    const recentPct   = pct(recentAcc.filter((r) => r.isCorrect).length, recentAcc.length)
    const accTrend    = (recentPct > earlyPct ? 'up' : recentPct < earlyPct ? 'down' : 'neutral') as 'up' | 'down' | 'neutral'

    const earlyRT  = avg(earlyAcc.map((r) => r.reactionTimeMs))
    const recentRT = avg(recentAcc.map((r) => r.reactionTimeMs))
    // Lower RT = improvement = "up" trend for motor speed
    const rtTrend  = (recentRT < earlyRT ? 'up' : recentRT > earlyRT ? 'down' : 'neutral') as 'up' | 'down' | 'neutral'

    // Consistency (last 30 days engagement)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Get unique days played in the last 30 days
    const uniqueDaysPlayed = new Set(
      allSessions
        .filter(s => new Date(s.completedAt) >= thirtyDaysAgo)
        .map(s => s.completedAt.split('T')[0])
    ).size
    
    // Adherence percentage (target is playing every day)
    const consistencyPct = Math.round((uniqueDaysPlayed / 30) * 100)
    
    const consTrend = consistencyPct >= 50 ? 'up' : 'down' // Simplistic trend

    return { accuracy, avgRTSec, totalSessions: allSessions.length, accTrend, rtTrend, consistencyPct, consTrend }
  }, [allSessions])

  // ── AI insights (computed from data, not hard-coded) ───────────────────

  const insights = useMemo(() => {
    const list: InsightBadgeProps[] = []

    if (metrics.accuracy >= 80) {
      list.push({ type: 'positive', text: `Strong cognitive accuracy at ${metrics.accuracy}%. Patient demonstrates reliable short-term recall and arithmetic processing.` })
    } else if (metrics.accuracy >= 60) {
      list.push({ type: 'warning', text: `Cognitive accuracy is ${metrics.accuracy}% — approaching the clinical fatigue threshold of 60%. Consider reducing session length or increasing rest intervals.` })
    } else {
      list.push({ type: 'warning', text: `Accuracy has fallen to ${metrics.accuracy}%. Recommend caregiver observation during upcoming sessions and consultation with the supervising clinician.` })
    }

    const rtNum = parseFloat(metrics.avgRTSec)
    if (rtNum < 4) {
      list.push({ type: 'positive', text: `Average response time of ${metrics.avgRTSec}s indicates good motor-cognitive coordination. Patient is engaging confidently with dual tasks.` })
    } else if (rtNum < 7) {
      list.push({ type: 'info', text: `Response time averaging ${metrics.avgRTSec}s. This is within the expected range for this age group. Monitor for further slowing over the next week.` })
    } else {
      list.push({ type: 'warning', text: `Response time of ${metrics.avgRTSec}s is elevated. This may indicate cognitive fatigue, medication effects, or increased motor difficulty. Flag for clinical review.` })
    }

    if (metrics.accTrend === 'up') {
      list.push({ type: 'positive', text: 'Accuracy is improving session-over-session — a positive trajectory consistent with cognitive exercise benefit.' })
    }
    if (metrics.rtTrend === 'up') {
      list.push({ type: 'positive', text: 'Motor response speed is improving over time. Physical task engagement appears to be effective.' })
    }
    if (metrics.accTrend === 'down') {
      list.push({ type: 'warning', text: 'Accuracy has declined in recent sessions. Review daily routine, sleep quality, and medication schedule with the patient\'s care team.' })
    }
    
    if (metrics.consistencyPct >= 70) {
      list.push({ type: 'positive', text: `Patient engagement is outstanding (${metrics.consistencyPct}% 30-day consistency). The gamified reward system is effectively motivating daily adherence.` })
    } else if (metrics.consistencyPct < 30 && metrics.totalSessions > 0) {
      list.push({ type: 'warning', text: `Patient engagement is low (${metrics.consistencyPct}% 30-day consistency). Consider using the streak and reward system to encourage more frequent play.` })
    }

    list.push({ type: 'info', text: `${metrics.totalSessions} sessions recorded. For clinically meaningful trend data, aim for at least 10 sessions before drawing diagnostic conclusions.` })

    return list
  }, [metrics])

  // ── Export handler ──────────────────────────────────────────────────────

  async function handleExport() {
    setExportState('loading')

    let pdfInsights = insights // fallback to predefined

    try {
      const res = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, sessionCount: allSessions.length })
      })

      if (res.ok) {
        const data = await res.json()
        if (data && data.insights && Array.isArray(data.insights)) {
          pdfInsights = data.insights
        }
      }
    } catch (e) {
      console.error('Failed to fetch AI insights, falling back to static rules:', e)
    }

    try {
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(22)
      doc.setTextColor(87, 115, 97) // sage-dark
      doc.text('Cognia Clinical Report', 14, 22)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`, 14, 30)
      
      // Summary Metrics
      doc.setFontSize(14)
      doc.setTextColor(15, 23, 42) // slate-900
      doc.text('Summary Metrics', 14, 45)
      
      doc.setFontSize(11)
      doc.setTextColor(71, 85, 105) // slate-600
      doc.text(`Overall Accuracy: ${metrics.accuracy}%`, 14, 53)
      doc.text(`Avg Response Time: ${metrics.avgRTSec}s`, 14, 60)
      doc.text(`Total Sessions: ${metrics.totalSessions}`, 14, 67)
      
      // AI Clinical Insights
      doc.setFontSize(14)
      doc.setTextColor(15, 23, 42) // slate-900
      doc.text('AI Clinical Insights', 14, 82)
      
      let yPos = 90
      pdfInsights.forEach((ins) => {
        if (ins.type === 'positive') doc.setTextColor(21, 128, 61) // green-700
        else if (ins.type === 'warning') doc.setTextColor(185, 28, 28) // red-700
        else doc.setTextColor(87, 115, 97) // sage-dark
        
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`[${ins.type.toUpperCase()}]`, 14, yPos)
        
        doc.setFont("helvetica", "normal")
        doc.setTextColor(71, 85, 105) // slate-600
        doc.text(ins.text, 14, yPos + 6)
        yPos += 14
      })

      // Table of sessions
      const tableRows = allSessions.map((s) => {
        const corr   = s.results.filter((r) => r.isCorrect).length
        const accPct = pct(corr, s.results.length)
        const rtSec  = (avg(s.results.map((r) => r.reactionTimeMs)) / 1000).toFixed(1)
        return [
          formatDate(s.completedAt),
          `${accPct}%`,
          `${rtSec}s`,
          String(s.results.length)
        ]
      })

      autoTable(doc, {
        startY: yPos + 10,
        head: [['Date', 'Accuracy', 'Avg Response', 'Rounds']],
        body: tableRows,
        headStyles: { fillColor: [111, 143, 122] }, // #6F8F7A Sage Green
        styles: { fontSize: 9 },
      })

      doc.save(`cognia-clinical-report-${new Date().toISOString().split('T')[0]}.pdf`)
      setExportState('done')
      setTimeout(() => setExportState('idle'), 4000)
    } catch (err) {
      console.error(err)
      setExportState('idle')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="max-w-4xl mx-auto flex flex-col gap-6"
      style={{ padding: '0 1rem' }}
    >

      {/* ── Patient Profile Header / Quick Switch ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div>
          <h1
            className="font-extrabold tracking-tight m-0"
            style={{ fontSize: 'var(--font-size-accessible-2xl)', color: 'var(--color-content-primary)' }}
          >
            Caregiver Clinical Hub
          </h1>
          <p
            className="m-0 mt-1"
            style={{ fontSize: 'var(--font-size-accessible-base)', color: 'var(--color-content-secondary)' }}
          >
            Real-time dual-task performance telemetry & cognitive indicators.
          </p>
        </div>

        {/* Export button */}
        <button
          type="button"
          id="export-doctor-report-btn"
          className="btn-accessible-primary"
          onClick={handleExport}
          disabled={exportState === 'loading'}
          aria-live="polite"
          aria-label="Export doctor report as a text file"
          style={{
            backgroundColor:
              exportState === 'done'
                ? 'var(--color-accessible-green)'
                : undefined,
            minWidth: '220px',
          }}
        >
          {exportState === 'idle'    && <><span aria-hidden="true">📄</span> Export Doctor Report</>}
          {exportState === 'loading' && <><span aria-hidden="true">⏳</span> Preparing…</>}
          {exportState === 'done'    && <><span aria-hidden="true">✅</span> Report Downloaded</>}
        </button>
      </div>

      {/* ── Tabs Navigation ──────────────────────────────────────────────── */}
      <div className="flex gap-4 border-b-2 border-[#E8EFEA] dark:border-[#28372E] mb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 text-xl font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-b-4 border-[#6F8F7A] text-[#42594B] dark:border-[#8BAFA0] dark:text-[#A5C4B7]'
              : 'text-[#6B7C73] dark:text-[#A3B3AA] hover:text-[#29352F] dark:hover:text-[#F7F4EC] border-b-4 border-transparent'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-2 text-xl font-bold transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'border-b-4 border-[#6F8F7A] text-[#42594B] dark:border-[#8BAFA0] dark:text-[#A5C4B7]'
              : 'text-[#6B7C73] dark:text-[#A3B3AA] hover:text-[#29352F] dark:hover:text-[#F7F4EC] border-b-4 border-transparent'
          }`}
        >
          Patient Stats
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          {/* ── Summary metrics grid ─────────────────────────────────────────── */}
          <section aria-labelledby="metrics-heading">
            <h2
              id="metrics-heading"
              className="font-bold mb-4"
              style={{ fontSize: 'var(--font-size-accessible-lg)', color: 'var(--color-content-primary)' }}
            >
              Summary Metrics
            </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Overall Accuracy"
            value={`${metrics.accuracy}%`}
            sub={`Across ${allSessions.flatMap((s) => s.results).length} rounds`}
            icon="🧠"
            accent="#6F8F7A"
            bg="#E8EFEA"
            trend={metrics.accTrend}
          />
          <MetricCard
            label="Avg Response Time"
            value={`${metrics.avgRTSec}s`}
            sub="Lower is faster"
            icon="⚡"
            accent="var(--color-accessible-amber)"
            bg="#FEF9C3"
            trend={metrics.rtTrend}
          />
          <MetricCard
            label="30-Day Consistency"
            value={`${metrics.consistencyPct}%`}
            sub="Patient Engagement"
            icon="🔥"
            accent="var(--color-accessible-red)"
            bg="#FEE2E2"
            trend={metrics.consTrend as any}
          />
          <MetricCard
            label="Sessions Completed"
            value={String(metrics.totalSessions)}
            sub="All-time total"
            icon="🗓️"
            accent="var(--color-accessible-green)"
            bg="#DCFCE7"
            trend="neutral"
          />
        </div>
          </section>

          {/* ── AI Clinical Insights ─────────────────────────────────────────── */}
          <section
            aria-labelledby="insights-heading"
            className="card-accessible"
            style={{ borderColor: '#6F8F7A' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                aria-hidden="true"
                style={{ backgroundColor: '#E8EFEA' }}
              >
                🤖
              </div>
              <div>
                <h2
                  id="insights-heading"
                  className="font-bold"
                  style={{ fontSize: 'var(--font-size-accessible-lg)', color: 'var(--color-content-primary)' }}
                >
                  AI Clinical Insights
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-content-muted)' }}>
                  Auto-generated · Not a medical diagnosis
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3" role="list" aria-label="Clinical insights list">
              {insights.map((ins, i) => (
                <InsightBadge key={i} type={ins.type} text={ins.text} />
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          {/* ── Trend chart ──────────────────────────────────────────────────── */}
          <section aria-labelledby="trend-heading">
            <h2
              id="trend-heading"
              className="sr-only"
            >
              Performance Trend Chart
            </h2>
            <TrendChart sessions={[...allSessions].reverse().slice(0, 6)} />
          </section>

          {/* ── Session history table ─────────────────────────────────────────── */}
          <section aria-labelledby="history-heading">
            <h2
              id="history-heading"
              className="font-bold mb-4"
              style={{ fontSize: 'var(--font-size-accessible-lg)', color: 'var(--color-content-primary)' }}
            >
              Session History
            </h2>

        <div className="card-accessible overflow-x-auto">
          <table
            className="w-full border-collapse"
            role="table"
            aria-label="All completed game sessions"
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['Date', 'Accuracy', 'Avg Response', 'Rounds'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="text-left pb-3 pr-4"
                    style={{ fontSize: 'var(--font-size-accessible-sm)', color: 'var(--color-content-muted)', fontWeight: 700 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allSessions.map((s, i) => {
                const corr   = s.results.filter((r) => r.isCorrect).length
                const accPct = pct(corr, s.results.length)
                const rtSec  = (avg(s.results.map((r) => r.reactionTimeMs)) / 1000).toFixed(1)
                const isGood = accPct >= 75

                return (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: i < allSessions.length - 1 ? '1px solid #F1F5F9' : 'none',
                    }}
                  >
                    <td
                      className="py-3 pr-4 font-semibold"
                      style={{ fontSize: 'var(--font-size-accessible-sm)', color: 'var(--color-content-secondary)' }}
                    >
                      {formatDate(s.completedAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold"
                        style={{
                          fontSize: '0.875rem',
                          backgroundColor: isGood ? '#DCFCE7' : '#FEE2E2',
                          color: isGood ? 'var(--color-accessible-green)' : 'var(--color-accessible-red)',
                        }}
                      >
                        {accPct}%
                      </span>
                    </td>
                    <td
                      className="py-3 pr-4 font-semibold"
                      style={{ fontSize: 'var(--font-size-accessible-sm)', color: 'var(--color-content-secondary)' }}
                    >
                      {rtSec}s
                    </td>
                    <td
                      className="py-3 font-semibold"
                      style={{ fontSize: 'var(--font-size-accessible-sm)', color: 'var(--color-content-muted)' }}
                    >
                      {s.results.length}
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      )}
    </div>
  )
}

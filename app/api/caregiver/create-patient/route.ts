import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword, validatePassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { caregiverId, patientName, patientEmail, password } = body

    if (!caregiverId || !patientName || !patientEmail || !password) {
      return NextResponse.json(
        { error: 'Caregiver ID, patient name, email, and password are required.' },
        { status: 400 }
      )
    }

    // 1. Verify caregiver
    const { data: caregiver, error: cgError } = await supabase
      .from('profiles')
      .select('id, full_name, role, email')
      .eq('id', caregiverId)
      .maybeSingle()

    if (cgError || !caregiver || (!caregiver.role?.includes('caregiver') && caregiver.role !== 'caregiver, patient')) {
      return NextResponse.json(
        { error: 'Authorized caregiver account not found.' },
        { status: 403 }
      )
    }

    const cleanEmail = String(patientEmail).trim().toLowerCase()
    const cleanName = String(patientName).trim()

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address for the patient.' },
        { status: 400 }
      )
    }

    // 3. Handle case where caregiver is adding themselves as patient
    if (cleanEmail === caregiver.email?.toLowerCase()) {
      const currentRole = caregiver.role || 'caregiver'
      const combinedRole = currentRole.includes('patient') ? currentRole : 'caregiver, patient'

      await supabase
        .from('profiles')
        .update({ role: combinedRole })
        .eq('id', caregiver.id)

      await supabase
        .from('patient_caregiver_relations')
        .upsert({ patient_id: caregiver.id, caregiver_id: caregiver.id })

      return NextResponse.json({
        success: true,
        message: 'Caregiver linked as self patient successfully.',
        patient: { id: caregiver.id, full_name: caregiver.full_name, email: caregiver.email, role: combinedRole }
      })
    }

    // 4. Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // 5. Check if profile already exists for this email
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existingUser) {
      if (existingUser.role === 'caregiver') {
        // Upgrade existing caregiver to combined 'caregiver, patient'
        await supabase
          .from('profiles')
          .update({ role: 'caregiver, patient' })
          .eq('id', existingUser.id)

        await supabase
          .from('patient_caregiver_relations')
          .upsert({ patient_id: existingUser.id, caregiver_id: caregiver.id })

        return NextResponse.json({
          success: true,
          message: 'User updated to include patient role and linked successfully.',
          patient: { id: existingUser.id, full_name: existingUser.full_name, email: existingUser.email, role: 'caregiver, patient' }
        })
      }

      return NextResponse.json(
        { error: 'A patient account with this email already exists.' },
        { status: 409 }
      )
    }

    // 5. Hash password & create profile
    const passwordHash = hashPassword(password)
    let newPatient: any = null

    const insertPayload = {
      email: cleanEmail,
      full_name: cleanName,
      role: 'patient',
      password_hash: passwordHash,
      preferences: {}
    }

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert(insertPayload)
      .select('id, full_name, email, role')
      .single()

    if (insertError) {
      // Fallback if password_hash column not added to DB yet
      if (insertError.code === '42703' || insertError.message?.includes('password_hash')) {
        const fallbackPayload = {
          email: cleanEmail,
          full_name: cleanName,
          role: 'patient',
          preferences: { password_hash: passwordHash }
        }
        const { data: fallbackCreated, error: fallbackError } = await supabase
          .from('profiles')
          .insert(fallbackPayload)
          .select('id, full_name, email, role')
          .single()

        if (fallbackError) {
          return NextResponse.json(
            { error: 'Failed to create patient: ' + fallbackError.message },
            { status: 500 }
          )
        }
        newPatient = fallbackCreated
      } else {
        return NextResponse.json(
          { error: 'Failed to create patient: ' + insertError.message },
          { status: 500 }
        )
      }
    } else {
      newPatient = created
    }

    // 6. Automatically link patient to caregiver
    if (newPatient) {
      await supabase
        .from('patient_caregiver_relations')
        .upsert({
          caregiver_id: caregiverId,
          patient_id: newPatient.id
        })
    }

    return NextResponse.json({
      success: true,
      patient: {
        id: newPatient.id,
        full_name: newPatient.full_name,
        email: newPatient.email,
        role: newPatient.role
      }
    })
  } catch (err: any) {
    console.error('Direct patient creation error:', err)
    return NextResponse.json(
      { error: 'Internal server error while creating patient.' },
      { status: 500 }
    )
  }
}

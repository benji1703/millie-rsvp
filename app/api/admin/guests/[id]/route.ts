import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function secureJson(data: unknown, init?: ResponseInit) {
  const res = NextResponse.json(data, init)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  return res
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const VALID_STATUSES = ['pending', 'confirmed', 'declined'] as const
  type RsvpStatus = typeof VALID_STATUSES[number]

  let body: { name?: string; phone?: string; guest_count?: number; children_allowed?: boolean; children_count?: number; rsvp_status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.name !== undefined) {
    const name = body.name.trim()
    if (!name || name.length > 100) {
      return NextResponse.json({ error: 'Name must be 1-100 characters' }, { status: 400 })
    }
    body.name = name
  }

  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    if (!/^[+\d\s\-().]{7,20}$/.test(body.phone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 })
    }
  }

  if (body.guest_count !== undefined) {
    if (body.guest_count < 1 || body.guest_count > 20) {
      return NextResponse.json({ error: 'Guest count must be 1-20' }, { status: 400 })
    }
  }

  if (body.children_count !== undefined) {
    if (!Number.isInteger(body.children_count) || body.children_count < 0 || body.children_count > 20) {
      return NextResponse.json({ error: 'children_count must be an integer between 0 and 20' }, { status: 400 })
    }
  }

  if (body.rsvp_status !== undefined && !(VALID_STATUSES as readonly string[]).includes(body.rsvp_status)) {
    return NextResponse.json({ error: 'Invalid rsvp_status' }, { status: 400 })
  }

  const updates: Record<string, string | number | boolean | null> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.phone !== undefined) updates.phone = body.phone || null
  if (body.guest_count !== undefined) updates.guest_count = body.guest_count
  if (body.children_allowed !== undefined) updates.children_allowed = body.children_allowed
  if (body.children_count !== undefined) updates.children_count = body.children_count
  if (body.rsvp_status !== undefined) updates.rsvp_status = body.rsvp_status

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  // Fetch current status before updating (needed for audit log)
  let previousStatus: string | null = null
  if (body.rsvp_status !== undefined) {
    const { data: current } = await supabaseAdmin
      .from('guests').select('rsvp_status').eq('id', params.id).single()
    previousStatus = current?.rsvp_status ?? null
  }

  const { data: guest, error } = await supabaseAdmin
    .from('guests')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return secureJson({ error: error.message }, { status: 500 })

  const auditInserts = []

  if (body.rsvp_status !== undefined && body.rsvp_status !== previousStatus) {
    auditInserts.push(supabaseAdmin.from('rsvp_audit_log').insert({
      guest_id: params.id,
      action: 'admin_status_update',
      previous_status: previousStatus,
      new_status: body.rsvp_status as RsvpStatus,
    }))
  }

  const editedFields = Object.keys(updates).filter(k => k !== 'rsvp_status')
  if (editedFields.length > 0) {
    auditInserts.push(supabaseAdmin.from('rsvp_audit_log').insert({
      guest_id: params.id,
      action: 'admin_edit',
      metadata: { fields: editedFields },
    }))
  }

  await Promise.all(auditInserts)

  return secureJson(guest)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return secureJson({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabaseAdmin
    .from('guests')
    .delete()
    .eq('id', params.id)

  if (error) return secureJson({ error: error.message }, { status: 500 })
  return secureJson({ success: true })
}

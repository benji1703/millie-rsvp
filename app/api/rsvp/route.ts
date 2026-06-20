import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rateLimit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function secureJson(data: unknown, init?: ResponseInit) {
  const res = NextResponse.json(data, init)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  return res
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 10, 60_000)) {
    return secureJson({ error: 'Too many requests' }, { status: 429 })
  }

  if (!req.headers.get('content-type')?.includes('application/json')) {
    return secureJson({ error: 'Unsupported Media Type' }, { status: 415 })
  }

  let body: { guestId?: string; attending?: boolean; guestCount?: number; childrenCount?: number }
  try {
    body = await req.json()
  } catch {
    return secureJson({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { guestId, attending, guestCount, childrenCount } = body

  if (!guestId || attending === undefined) {
    return secureJson({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!UUID_RE.test(guestId)) {
    return secureJson({ error: 'Invalid guest ID' }, { status: 400 })
  }

  if (attending) {
    if (!guestCount || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
      return secureJson({ error: 'guestCount must be an integer between 1 and 20' }, { status: 400 })
    }
  }

  const { data: guest } = await supabaseAdmin
    .from('guests')
    .select('id, rsvp_status, guest_count, children_allowed, children_count')
    .eq('id', guestId)
    .single()

  if (!guest) {
    return secureJson({ error: 'Not found' }, { status: 404 })
  }

  if (attending && guest.children_allowed) {
    const cc = childrenCount ?? 0
    if (!Number.isInteger(cc) || cc < 0 || cc > 20) {
      return secureJson({ error: 'childrenCount must be an integer between 0 and 20' }, { status: 400 })
    }
  }

  const isUpdate = guest.rsvp_status !== 'pending'
  const prevStatus = guest.rsvp_status
  const prevCount = guest.guest_count

  await supabaseAdmin
    .from('guests')
    .update({
      rsvp_status: attending ? 'confirmed' : 'declined',
      guest_count: attending ? guestCount : null,
      children_count: attending && guest.children_allowed ? (childrenCount ?? 0) : null,
      responded_at: new Date().toISOString(),
      session_token: null,
    })
    .eq('id', guestId)

  const action = isUpdate ? 'rsvp_update' : 'rsvp_submit'
  await supabaseAdmin.from('rsvp_audit_log').insert({
    guest_id: guestId,
    action,
    ip_address: ip,
    user_agent: req.headers.get('user-agent') ?? null,
    previous_status: prevStatus,
    new_status: attending ? 'confirmed' : 'declined',
    previous_count: prevCount,
    new_count: attending ? guestCount : null,
    metadata: { children_count: attending ? (childrenCount ?? 0) : null },
  })

  return secureJson({ success: true, isUpdate })
}

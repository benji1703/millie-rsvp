import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rateLimit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHORT_CODE_RE = /^[0-9a-f]{12}$/i

function secureJson(data: unknown, init?: ResponseInit) {
  const res = NextResponse.json(data, init)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  return res
}

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  if (!rateLimit(ip, 30, 60_000)) {
    return secureJson({ error: 'Too many requests' }, { status: 429 })
  }

  const { code } = params
  let query = supabaseAdmin
    .from('guests')
    .select('id, name, rsvp_status, guest_count, short_code')

  if (UUID_RE.test(code)) {
    query = query.eq('id', code)
  } else if (SHORT_CODE_RE.test(code)) {
    query = query.eq('short_code', code)
  } else {
    return secureJson({ error: 'Invalid ID' }, { status: 400 })
  }

  const { data: guest } = await query.single()

  if (!guest) {
    return secureJson({ error: 'Not found' }, { status: 404 })
  }

  await supabaseAdmin.from('rsvp_audit_log').insert({
    guest_id: guest.id,
    action: 'view',
    ip_address: ip,
    user_agent: req.headers.get('user-agent') ?? null,
    metadata: { timestamp: new Date().toISOString() },
  })

  return secureJson(guest)
}

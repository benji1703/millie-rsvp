import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkCsrf } from '@/lib/csrf'
import { rateLimit } from '@/lib/rateLimit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function secureJson(data: unknown, init?: ResponseInit) {
  const res = NextResponse.json(data, init)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  return res
}

export async function POST(req: NextRequest) {
  if (!checkCsrf(req)) {
    return secureJson({ error: 'invalid request' }, { status: 403 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (!rateLimit(ip, 30, 60_000)) {
    return secureJson({ error: 'Too many requests' }, { status: 429 })
  }

  if (!req.headers.get('content-type')?.includes('application/json')) {
    return secureJson({ error: 'Unsupported Media Type' }, { status: 415 })
  }

  try {
    const body = await req.json()
    const { guestId } = body

    if (typeof guestId !== 'string' || !UUID_RE.test(guestId)) {
      return secureJson({ error: 'Invalid guestId' }, { status: 400 })
    }

    const { data: guest } = await supabaseAdmin
      .from('guests')
      .select('id')
      .eq('id', guestId)
      .single()

    if (!guest) {
      return secureJson({ error: 'Not found' }, { status: 404 })
    }

    await supabaseAdmin.from('rsvp_audit_log').insert({
      guest_id: guestId,
      action: 'view',
      ip_address: ip,
      user_agent: req.headers.get('user-agent') ?? null,
    })

    return secureJson({ ok: true })
  } catch {
    return secureJson({ error: 'Failed' }, { status: 500 })
  }
}

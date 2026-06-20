import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkCsrf } from '@/lib/csrf'
import { isNonEmptyString } from '@/lib/validate'

export async function POST(req: NextRequest) {
  if (!checkCsrf(req)) {
    return NextResponse.json({ error: 'invalid request' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { guestId } = body

    if (!isNonEmptyString(guestId, 100)) {
      return NextResponse.json({ error: 'Invalid guestId' }, { status: 400 })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      null

    await supabaseAdmin.from('rsvp_audit_log').insert({
      guest_id: guestId,
      action: 'view',
      ip_address: ip,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

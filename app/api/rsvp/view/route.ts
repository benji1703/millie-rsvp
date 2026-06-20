import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { guestId } = await req.json()
    if (!guestId || typeof guestId !== 'string') {
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

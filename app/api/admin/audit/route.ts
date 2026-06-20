import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const guestId = new URL(req.url).searchParams.get('guestId')

  if (guestId !== null && (typeof guestId !== 'string' || guestId.trim().length === 0 || guestId.length > 100)) {
    return NextResponse.json({ error: 'Invalid guestId' }, { status: 400 })
  }

  let query = supabaseAdmin
    .from('rsvp_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (guestId) query = query.eq('guest_id', guestId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

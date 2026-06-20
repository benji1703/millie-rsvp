import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { shortCodeFromId } from '@/lib/shortCode'

const PHONE_RE = /^[+\d\s\-().]{7,20}$/

function secureJson(data: unknown, init?: ResponseInit) {
  const res = NextResponse.json(data, init)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  return res
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session ?? null
}

const VALID_SORT_COLS = ['name', 'guest_count', 'rsvp_status', 'last_activity'] as const
type SortParam = typeof VALID_SORT_COLS[number]

function toDbCol(sort: SortParam): string {
  return sort === 'last_activity' ? 'last_activity_at' : sort
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return secureJson({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.trim() ?? ''
  const sortParam = searchParams.get('sort') ?? 'name'
  const orderParam = searchParams.get('order') ?? 'asc'

  const sort: SortParam = (VALID_SORT_COLS as readonly string[]).includes(sortParam)
    ? (sortParam as SortParam)
    : 'name'
  const ascending = orderParam === 'asc'

  let query = supabaseAdmin.from('guests').select('*')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  query = query.order(toDbCol(sort), { ascending, nullsFirst: false })

  const { data: guests, error } = await query

  if (error) return secureJson({ error: error.message }, { status: 500 })
  return secureJson(guests ?? [])
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return secureJson({ error: 'Unauthorized' }, { status: 401 })

  if (!req.headers.get('content-type')?.includes('application/json')) {
    return secureJson({ error: 'Unsupported Media Type' }, { status: 415 })
  }

  let body: { name?: string; phone?: string; guest_count?: number; children_allowed?: boolean }
  try {
    body = await req.json()
  } catch {
    return secureJson({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name || name.length < 1 || name.length > 100) {
    return secureJson({ error: 'Name must be 1–100 characters' }, { status: 400 })
  }

  if (body.phone !== undefined && body.phone !== '') {
    const phone = body.phone.trim()
    if (!PHONE_RE.test(phone)) {
      return secureJson({ error: 'Invalid phone format' }, { status: 400 })
    }
  }

  if (body.guest_count !== undefined) {
    const gc = body.guest_count
    if (!Number.isInteger(gc) || gc < 1 || gc > 20) {
      return secureJson({ error: 'guest_count must be an integer between 1 and 20' }, { status: 400 })
    }
  }

  const id = randomUUID()
  const { data: guest, error } = await supabaseAdmin
    .from('guests')
    .insert({
      id,
      short_code: shortCodeFromId(id),
      name,
      phone: body.phone?.trim() || null,
      guest_count: body.guest_count ?? null,
      children_allowed: body.children_allowed ?? false,
    })
    .select()
    .single()

  if (error) return secureJson({ error: error.message }, { status: 500 })
  return secureJson(guest, { status: 201 })
}

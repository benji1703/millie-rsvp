import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { shortCodeFromId } from '@/lib/shortCode'

const PHONE_RE = /^[+\d\s\-().]{7,20}$/

interface CsvRow {
  name: string
  pax: number
  phone: string
  children_allowed: boolean
  children_count: number | null
}

function secureJson(data: unknown, init?: ResponseInit) {
  const res = NextResponse.json(data, init)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  return res
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return secureJson({ error: 'Unauthorized' }, { status: 401 })

  if (!req.headers.get('content-type')?.includes('application/json')) {
    return secureJson({ error: 'Unsupported Media Type' }, { status: 415 })
  }

  let rows: CsvRow[]
  try {
    rows = await req.json()
  } catch {
    return secureJson({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return secureJson({ error: 'No rows provided' }, { status: 400 })
  }

  if (rows.length > 300) {
    return secureJson({ error: 'Too many rows (max 300)' }, { status: 400 })
  }

  const inserts = rows
    .filter((r) => {
      const name = r.name?.trim()
      if (!name || name.length < 1 || name.length > 100) return false
      const pax = Number(r.pax)
      if (!Number.isInteger(pax) || pax < 1 || pax > 20) return false
      if (r.phone && !PHONE_RE.test(r.phone.trim())) return false
      return true
    })
    .map((r) => {
      const id = randomUUID()
      return {
        id,
        short_code: shortCodeFromId(id),
        name: r.name.trim(),
        phone: r.phone?.trim() || null,
        guest_count: Number(r.pax),
        children_allowed: r.children_allowed,
        children_count: r.children_allowed ? (r.children_count ?? null) : null,
      }
    })

  if (inserts.length === 0) {
    return secureJson({ error: 'No valid rows after validation' }, { status: 400 })
  }

  const { data: guests, error } = await supabaseAdmin
    .from('guests')
    .insert(inserts)
    .select()

  if (error) return secureJson({ error: error.message }, { status: 500 })
  return secureJson(guests, { status: 201 })
}

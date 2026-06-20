import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import RsvpFlow from '@/components/rsvp/RsvpFlow'
import type { Guest } from '@/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHORT_CODE_RE = /^[0-9a-f]{12}$/i

async function fetchGuest(code: string) {
  if (UUID_RE.test(code)) {
    const { data } = await supabaseAdmin
      .from('guests')
      .select('id, name, rsvp_status, guest_count, children_allowed, children_count, short_code')
      .eq('id', code)
      .single()
    return data
  }
  if (SHORT_CODE_RE.test(code)) {
    const { data } = await supabaseAdmin
      .from('guests')
      .select('id, name, rsvp_status, guest_count, children_allowed, children_count, short_code')
      .eq('short_code', code)
      .single()
    return data
  }
  return null
}

const SITE_URL = 'https://rsvp.arbibe.dev'
const OG_IMAGE = `${SITE_URL}/og-image.png`

export async function generateMetadata(): Promise<Metadata> {
  const title = 'הוזמנת לחגיגת בריתה מילי ארביב'
  const description = 'יום שישי · 3.7.2026 · 12:00 · West Garden, ויצמן 273 רעננה · לחץ לאישור הגעה'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'משפחת ארביב',
      locale: 'he_IL',
      type: 'website',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  }
}

export default async function RsvpPage({ params }: { params: { code: string } }) {
  const guest = await fetchGuest(params.code)
  if (!guest) notFound()

  return <RsvpFlow guest={guest as Guest} />
}

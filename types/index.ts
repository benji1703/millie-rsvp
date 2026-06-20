export type RsvpStatus = 'pending' | 'confirmed' | 'declined'

export interface Guest {
  id: string
  short_code: string
  name: string
  phone: string | null
  rsvp_status: RsvpStatus
  guest_count: number | null
  children_allowed: boolean
  children_count: number | null
  responded_at: string | null
  session_token: string | null
  created_at: string
  last_activity_at: string | null
}


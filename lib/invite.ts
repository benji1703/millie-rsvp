import type { Guest } from '@/types'

const BASE_URL = 'https://rsvp.arbibe.dev'
const EVENT_LINE = 'יום שישי | 3.7.2026 | 12:00\nWest Garden, ויצמן 273, רעננה'

export function buildRsvpLink(guest: Guest): string {
  return `${BASE_URL}/rsvp/${guest.short_code ?? guest.id}`
}

function formatPhone(phone: string | null): string {
  return phone ? phone.replace(/\D/g, '').replace(/^0/, '972') : ''
}

// Group-style WhatsApp blast — used from the guest table row action
export function buildWhatsAppUrl(guest: Guest): string {
  const link = buildRsvpLink(guest)
  const message = `משפחה וחברים יקרים!\n\nהנכם מוזמנים לבריתה של מילי ארביב שתערך ביום שישי ה-3.7, ב-12:00.\n\nלצפייה בהזמנה ואישור הגעה לאירוע לחצו על הלינק הבא:\n${link}\n\nנשמח לראותכם,\nמשפחת ארביב`
  return `https://wa.me/${formatPhone(guest.phone)}?text=${encodeURIComponent(message)}`
}

// Personalized WhatsApp — used after adding a new guest
export function buildPersonalWhatsAppUrl(guest: Guest): string {
  const link = buildRsvpLink(guest)
  const message = `שלום ${guest.name}!\n\nהנכם מוזמנים לחגוג איתנו את בריתה של מילי ארביב 🥳\n\n${EVENT_LINE}\n\nלאישור הגעה:\n${link}\n\nנשמח לראותכם!\nמשפחת ארביב`
  return `https://wa.me/${formatPhone(guest.phone)}?text=${encodeURIComponent(message)}`
}

// Plain-text copy message — used from the guest table copy button
export function buildFullMessage(guest: Guest): string {
  return `שלום ${guest.name}!\n\nהנכם מוזמנים לחגוג איתנו את בריתה של מילי ארביב.\n\n${EVENT_LINE}\n\nלאישור הגעה:\n${buildRsvpLink(guest)}\n\nנשמח לראותכם!\nמשפחת ארביב`
}

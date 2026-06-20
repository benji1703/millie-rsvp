import type { Guest } from '@/types'

interface Props {
  guests: Guest[]
}

export default function SummaryBar({ guests }: Props) {
  const responded = guests.filter((g) => g.rsvp_status !== 'pending')
  const confirmed = guests.filter((g) => g.rsvp_status === 'confirmed')

  const totalInvitedPersons = guests.reduce((s, g) => s + (g.guest_count ?? 1), 0)
  const totalInvitedChildren = guests.filter(g => g.children_allowed).reduce((s, g) => s + (g.children_count ?? 0), 0)

  const totalConfirmedPersons = confirmed.reduce((s, g) => s + (g.guest_count ?? 0), 0)
  const totalConfirmedChildren = confirmed.filter(g => g.children_allowed).reduce((s, g) => s + (g.children_count ?? 0), 0)

  const stats = [
    {
      label: 'הוזמנו',
      value: totalInvitedPersons,
      sub: totalInvitedChildren > 0 ? `(${totalInvitedChildren} ילדים)` : null,
    },
    {
      label: 'ענו',
      value: responded.length,
      sub: guests.length > 0 ? `${responded.length} / ${guests.length} משפחות (${Math.round(responded.length / guests.length * 100)}%)` : `0 / 0 משפחות`,
    },
    {
      label: 'מגיעים',
      value: totalConfirmedPersons,
      sub: totalConfirmedChildren > 0 ? `(${totalConfirmedChildren} ילדים)` : null,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map(({ label, value, sub }) => (
        <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-black/[0.06]">
          <p className="text-4xl font-sans font-semibold text-charcoal">{value}</p>
          {sub && <p className="text-xs text-charcoal/60 font-sans mt-0.5">{sub}</p>}
          <p className="text-sm text-charcoal/70 font-medium mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}

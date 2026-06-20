import RsvpCard from '@/components/ui/RsvpCard'

export default function NotFound() {
  return (
    <RsvpCard>
      <div className="divider-line w-10 mx-auto mb-7" />
      <h2 className="font-serif text-xl font-light text-charcoal mb-2">הקישור אינו תקין</h2>
      <p className="text-charcoal/45 text-[13px] font-sans font-light leading-relaxed">פנה למשפחת ארביב לקישור חדש.</p>
      <p className="mt-7 text-[11px] text-gold tracking-[0.2em] uppercase font-sans font-light">משפחת ארביב</p>
    </RsvpCard>
  )
}

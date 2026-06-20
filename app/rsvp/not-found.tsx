import RsvpCard from '@/components/ui/RsvpCard'

export default function NotFound() {
  return (
    <RsvpCard>
      <div className="divider-ornament mb-5">✦</div>
      <h2 className="font-serif text-xl font-normal text-charcoal mb-2">הקישור אינו תקין</h2>
      <p className="text-charcoal/50 text-sm font-sans leading-relaxed">פנה למשפחת ארביב לקישור חדש.</p>
      <p className="mt-6 text-xs text-gold tracking-widest font-sans">משפחת ארביב</p>
    </RsvpCard>
  )
}

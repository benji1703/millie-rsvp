import RsvpCard from '@/components/ui/RsvpCard'
import WazeButton from '@/components/ui/WazeButton'

interface Props {
  guestName: string
  onConfirm: () => void
  onDecline: () => void
  declining: boolean
  existingStatus?: 'pending' | 'confirmed' | 'declined'
}

export default function LandingStep({ guestName, onConfirm, onDecline, declining, existingStatus }: Props) {
  return (
    <RsvpCard>
      <div className="animate-fade-up-d1">
        <div className="divider-ornament mb-7">✦</div>
      </div>

      <div className="animate-fade-up-d1">
        <p className="font-sans text-sm text-charcoal/50 leading-relaxed mb-1">
          שלום <span className="font-medium text-charcoal">{guestName}</span>,
        </p>
        <p className="font-sans text-sm text-charcoal/50 leading-relaxed">
          אנו שמחים להזמינכם לחגוג איתנו את בריתה של
        </p>
      </div>

      <h1 className="font-serif text-4xl font-normal text-charcoal tracking-tight mt-5 mb-7 animate-fade-up-d2">
        מילי ארביב
      </h1>

      <div className="bg-parchment/50 rounded-xl border border-gold/15 p-5 mb-7 flex flex-col items-center gap-1.5 animate-fade-up-d2">
        <p className="tracking-widest text-xs uppercase font-sans text-charcoal/60 font-medium">
          יום שישי | 3.7.2026 | 12:00
        </p>
        <p className="text-sm text-charcoal/70 font-sans font-medium">West Garden</p>
        <p className="text-sm text-charcoal/60 font-sans">ויצמן 273, רעננה</p>
        <WazeButton />
      </div>

      {(existingStatus === 'confirmed' || existingStatus === 'declined') && (
        <div className="animate-fade-up-d3 bg-parchment/50 border border-gold/15 rounded-lg px-4 py-2 mb-5 text-xs text-charcoal/50 font-sans text-center">
          {existingStatus === 'confirmed'
            ? 'כבר אישרת הגעה — תוכל/י לעדכן'
            : 'כבר ציינת שלא תגיע/י — תוכל/י לשנות'}
        </div>
      )}

      <div className="space-y-3 animate-fade-up-d3">
        <button onClick={onConfirm} className="btn-primary w-full py-4">
          מגיע/ה
        </button>
        <button onClick={onDecline} disabled={declining} className="btn-ghost w-full py-4">
          {declining ? 'שולח...' : 'לא מגיע/ה'}
        </button>
      </div>

      <p className="mt-8 text-xs text-gold tracking-widest uppercase font-sans animate-fade-up-d4">משפחת ארביב</p>
    </RsvpCard>
  )
}

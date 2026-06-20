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
      <div className="divider-line w-10 mx-auto mb-8 animate-fade-up-d1" />

      {/* Greeting */}
      <div className="animate-fade-up-d1">
        <p className="font-sans text-[14px] font-light text-charcoal/60 leading-relaxed tracking-[0.02em] mb-0.5">
          שלום <span className="font-medium text-charcoal/80">{guestName}</span>,
        </p>
        <p className="font-sans text-[14px] font-light text-charcoal/60 leading-relaxed tracking-[0.02em]">
          אנו שמחים להזמינכם לחגוג איתנו את בריתה של
        </p>
      </div>

      {/* Name */}
      <h1 className="font-serif text-[46px] leading-[1.1] font-light text-charcoal tracking-[0.04em] mt-5 mb-9 animate-fade-up-d2">
        מילי ארביב
      </h1>

      {/* Date / venue — instrument cluster */}
      <div className="border-y border-black/[0.08] py-5 mb-7 animate-fade-up-d2" dir="ltr">
        <p className="tracking-[0.22em] text-[10px] uppercase font-sans font-medium text-charcoal/50 mb-3" dir="rtl">
          פרטי האירוע
        </p>
        <div className="flex justify-center gap-6 text-center">
          <div>
            <p className="font-sans text-[22px] font-light text-charcoal leading-none">3.7</p>
            <p className="text-[9px] tracking-[0.16em] uppercase font-sans text-charcoal/50 mt-1">2026</p>
          </div>
          <div className="w-px bg-black/[0.10] self-stretch" />
          <div>
            <p className="font-sans text-[22px] font-light text-charcoal leading-none">12:00</p>
            <p className="text-[9px] tracking-[0.16em] uppercase font-sans text-charcoal/50 mt-1">יום שישי</p>
          </div>
          <div className="w-px bg-black/[0.10] self-stretch" />
          <div>
            <p className="text-[19px] font-sans font-light text-charcoal/80 leading-tight whitespace-nowrap">West Garden</p>
            <p className="text-[11px] tracking-[0.10em] font-sans text-charcoal/50 mt-1">רעננה</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <WazeButton />
        </div>
      </div>

      {/* Already responded notice */}
      {(existingStatus === 'confirmed' || existingStatus === 'declined') && (
        <div className="animate-fade-up-d3 mb-5 text-[13px] text-charcoal/55 font-sans font-light tracking-[0.02em] text-center">
          {existingStatus === 'confirmed'
            ? 'כבר אישרת הגעה — תוכל/י לעדכן'
            : 'כבר ציינת שלא תגיע/י — תוכל/י לשנות'}
        </div>
      )}

      {/* CTA buttons */}
      <div className="space-y-3 animate-fade-up-d3">
        <button onClick={onConfirm} className="btn-primary w-full py-[17px]">
          מגיע/ה
        </button>
        <button onClick={onDecline} disabled={declining} className="btn-ghost w-full py-[17px]">
          {declining ? 'שולח...' : 'לא מגיע/ה'}
        </button>
      </div>

      <p className="mt-8 text-[10px] text-gold tracking-[0.25em] uppercase font-sans font-light animate-fade-up-d4">
        משפחת ארביב
      </p>
    </RsvpCard>
  )
}

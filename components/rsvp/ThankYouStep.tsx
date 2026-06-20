import RsvpCard from '@/components/ui/RsvpCard'
import WazeButton from '@/components/ui/WazeButton'

interface Props {
  attending: boolean
  guestCount: number
  childrenCount?: number
  onChangeResponse?: () => void
}

export default function ThankYouStep({ attending, guestCount, childrenCount, onChangeResponse }: Props) {
  return (
    <RsvpCard>
      <div className="divider-line w-10 mx-auto mb-8" />

      {attending ? (
        <>
          <h2 className="font-serif text-[36px] font-light text-charcoal mb-4 leading-[1.2]">מחכים לכם!</h2>
          <p className="text-charcoal/75 text-[15px] leading-relaxed font-sans font-light">
            {`אישרת הגעה של ${guestCount} ${guestCount === 1 ? 'מבוגר' : 'מבוגרים'}${childrenCount ? ` ו-${childrenCount} ${childrenCount === 1 ? 'ילד' : 'ילדים'}` : ''}.`}
          </p>
          <p className="text-charcoal/60 text-[15px] font-sans font-light pt-5 mt-1">נתראה 🎉</p>
        </>
      ) : (
        <>
          <h2 className="font-serif text-[36px] font-light text-charcoal mb-4 leading-[1.2]">תודה על העדכון</h2>
          <p className="text-charcoal/75 text-[15px] leading-relaxed font-sans font-light">
            חבל שלא תוכלו להגיע. נחשוב עליכם!
          </p>
        </>
      )}

      <div className="mt-8 pt-6 border-t border-black/[0.08]">
        <p className="text-[13px] text-charcoal/60 font-sans font-light tracking-wide">West Garden · ויצמן 273, רעננה</p>
        <p className="text-[13px] text-charcoal/60 font-sans font-light tracking-wide mt-1">יום שישי · 3.7.2026</p>
        <div className="flex flex-col items-center gap-3 mt-5">
          {attending && <WazeButton />}
          {onChangeResponse && (
            <button
              onClick={onChangeResponse}
              className="text-[13px] text-charcoal/50 hover:text-charcoal/75 font-sans font-light underline underline-offset-2 transition-colors"
            >
              רוצה לשנות את התגובה?
            </button>
          )}
        </div>
        <p className="mt-5 text-[11px] text-gold tracking-[0.2em] uppercase font-sans font-light">משפחת ארביב</p>
      </div>
    </RsvpCard>
  )
}

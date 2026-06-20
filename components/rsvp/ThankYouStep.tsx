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
      <div className="divider-ornament mb-7">✦</div>

      {attending ? (
        <>
          <h2 className="font-serif text-3xl font-normal text-charcoal mb-4">מחכים לכם!</h2>
          <p className="text-charcoal/60 text-sm leading-relaxed font-sans">
            {`אישרת הגעה של ${guestCount} ${guestCount === 1 ? 'מבוגר' : 'מבוגרים'}${childrenCount ? ` ו-${childrenCount} ${childrenCount === 1 ? 'ילד' : 'ילדים'}` : ''}.`}
          </p>
          <p className="text-charcoal/60 text-sm font-sans pt-6 mt-2">נתראה 🎉</p>
        </>
      ) : (
        <>
          <h2 className="font-serif text-3xl font-normal text-charcoal mb-4">תודה על העדכון</h2>
          <p className="text-charcoal/60 text-sm leading-relaxed font-sans">
            חבל שלא תוכלו להגיע. נחשוב עליכם!
          </p>
        </>
      )}

      <div className="mt-8 pt-6 border-t border-parchment/60">
        <p className="text-xs text-charcoal/40 font-sans tracking-wide">West Garden · ויצמן 273, רעננה</p>
        <p className="text-xs text-charcoal/40 font-sans tracking-wide mt-1">יום שישי · 3.7.2026</p>
        <div className="flex flex-col items-center gap-3 mt-4">
          {attending && <WazeButton />}
          {onChangeResponse && (
            <button
              onClick={onChangeResponse}
              className="text-xs text-charcoal/40 hover:text-charcoal/70 font-sans underline underline-offset-2 transition-colors"
            >
              רוצה לשנות את התגובה?
            </button>
          )}
        </div>
        <p className="mt-4 text-xs text-gold tracking-widest uppercase font-sans">משפחת ארביב</p>
      </div>
    </RsvpCard>
  )
}

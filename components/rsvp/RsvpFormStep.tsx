'use client'
import { useState } from 'react'
import RsvpCard from '@/components/ui/RsvpCard'

interface Props {
  guestId: string
  defaultCount: number
  defaultChildrenCount: number
  childrenAllowed: boolean
  onSuccess: (guestCount: number, childrenCount: number) => void
}

const counterBtn = 'w-11 h-11 rounded-full border border-charcoal/20 bg-transparent text-charcoal text-2xl font-light hover:border-charcoal/50 hover:bg-parchment/40 active:scale-95 transition-all touch-manipulation select-none cursor-pointer'

export default function RsvpFormStep({ guestId, defaultCount, defaultChildrenCount, childrenAllowed, onSuccess }: Props) {
  const [guestCount, setGuestCount] = useState(Math.max(1, defaultCount))
  const [childrenCount, setChildrenCount] = useState(Math.max(0, defaultChildrenCount))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    setLoading(true)
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId, attending: true, guestCount, childrenCount }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'שגיאה. נסה שוב.'); return }
    onSuccess(guestCount, childrenCount)
  }

  return (
    <RsvpCard centered={false}>
      <h2 className="font-serif text-2xl font-normal text-charcoal text-center mb-1">כמה אנשים מגיעים?</h2>
      <p className="text-center text-charcoal/40 text-sm font-sans mb-8">כולל את עצמך</p>

      <div className="flex items-center justify-center gap-6 mb-2">
        <button onClick={() => setGuestCount((c) => Math.max(1, c - 1))} className={counterBtn}>−</button>
        <span className="font-serif text-6xl font-light text-charcoal w-16 text-center tabular-nums">
          {guestCount}
        </span>
        <button onClick={() => setGuestCount((c) => Math.min(15, c + 1))} className={counterBtn}>+</button>
      </div>
      <p className="text-center text-xs text-charcoal/30 font-sans mb-8">מבוגרים</p>

      {childrenAllowed && (
        <div className="mt-2 pt-6 border-t border-parchment">
          <h3 className="font-serif text-xl font-normal text-charcoal text-center mb-1">כמה ילדים?</h3>
          <p className="text-center text-charcoal/40 text-xs font-sans mb-6">ילדים עד גיל 12</p>
          <div className="flex items-center justify-center gap-6 mb-2">
            <button onClick={() => setChildrenCount((c) => Math.max(0, c - 1))} className={counterBtn}>−</button>
            <span className="font-serif text-5xl font-light text-charcoal w-16 text-center tabular-nums">
              {childrenCount}
            </span>
            <button onClick={() => setChildrenCount((c) => Math.min(20, c + 1))} className={counterBtn}>+</button>
          </div>
          <p className="text-center text-xs text-charcoal/30 font-sans mb-2">ילדים</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center font-sans mt-4 mb-2">{error}</p>}

      <button onClick={handleSubmit} disabled={loading} className="btn-primary mt-6 w-full py-4 disabled:cursor-not-allowed">
        {loading ? 'שולח...' : 'אשר הגעה'}
      </button>
    </RsvpCard>
  )
}

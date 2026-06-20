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

const counterBtn = 'w-12 h-12 rounded-full border border-black/[0.12] bg-transparent text-charcoal/65 text-2xl font-light hover:border-black/30 hover:text-charcoal active:scale-95 transition-all touch-manipulation select-none cursor-pointer'

function Counter({ value, onDec, onInc, label }: { value: number; onDec: () => void; onInc: () => void; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-7">
        <button onClick={onDec} className={counterBtn}>−</button>
        <span className="font-sans text-[72px] font-light text-charcoal w-16 text-center tabular-nums leading-none">
          {value}
        </span>
        <button onClick={onInc} className={counterBtn}>+</button>
      </div>
      <p className="text-[11px] tracking-[0.15em] uppercase font-sans font-light text-charcoal/55">{label}</p>
    </div>
  )
}

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
      <div className="divider-line w-10 mb-7" />

      <h2 className="font-serif text-[26px] font-light text-charcoal text-center mb-1">כמה אנשים מגיעים?</h2>
      <p className="text-center text-charcoal/55 text-[14px] font-sans font-light mb-9">כולל את עצמך</p>

      <div className="flex flex-col items-center mb-4">
        <Counter
          value={guestCount}
          onDec={() => setGuestCount((c) => Math.max(1, c - 1))}
          onInc={() => setGuestCount((c) => Math.min(10, c + 1))}
          label="מבוגרים"
        />
      </div>

      {childrenAllowed && (
        <div className="mt-4 pt-7 border-t border-black/[0.07]">
          <h3 className="font-serif text-[22px] font-light text-charcoal text-center mb-1">כמה ילדים?</h3>
          <p className="text-center text-charcoal/55 text-[13px] font-sans font-light mb-6">ילדים עד גיל 12</p>
          <div className="flex flex-col items-center">
            <Counter
              value={childrenCount}
              onDec={() => setChildrenCount((c) => Math.max(0, c - 1))}
              onInc={() => setChildrenCount((c) => Math.min(20, c + 1))}
              label="ילדים"
            />
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center font-sans mt-4 mb-2">{error}</p>}

      <button onClick={handleSubmit} disabled={loading} className="btn-primary mt-8 w-full py-[17px] disabled:cursor-not-allowed">
        {loading ? 'שולח...' : 'אשר הגעה'}
      </button>
    </RsvpCard>
  )
}

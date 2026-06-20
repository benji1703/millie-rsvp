'use client'
import { useState } from 'react'
import type { Guest } from '@/types'
import { buildRsvpLink, buildPersonalWhatsAppUrl } from '@/lib/invite'

interface Props {
  onAdded: (guest: Guest) => void
}

const inputCls = 'border border-parchment rounded-lg px-2.5 py-2 text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/40 transition-colors'

export default function AddGuestForm({ onAdded }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pax, setPax] = useState(2)
  const [childrenAllowed, setChildrenAllowed] = useState(false)
  const [childrenCount, setChildrenCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastGuest, setLastGuest] = useState<Guest | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLastGuest(null)
    setLoading(true)

    const res = await fetch('/api/admin/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim() || undefined,
        guest_count: pax,
        children_allowed: childrenAllowed,
        children_count: childrenAllowed ? childrenCount : undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'שגיאה'); return }

    setLastGuest(data as Guest)
    onAdded(data as Guest)
    setName('')
    setPhone('')
    setPax(2)
    setChildrenAllowed(false)
    setChildrenCount(0)
  }

  function copyLink() {
    if (!lastGuest) return
    navigator.clipboard.writeText(buildRsvpLink(lastGuest))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-parchment rounded-xl shadow-paper p-5 mb-6">
      <h2 className="font-serif text-lg mb-3">הוסף אורח</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 md:items-end">
        {/* Name + Phone row on mobile */}
        <div className="flex gap-2 flex-1">
          <div className="flex-1">
            <label className="text-xs text-charcoal/50 mb-1 block">שם *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ישראל ישראלי"
              required
              className={`${inputCls} w-full`}
            />
          </div>

          {/* Phone */}
          <div className="w-36 md:w-52 shrink-0">
            <label className="text-xs text-charcoal/50 mb-1 block">טלפון</label>
            <input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05X-XXXXXXX"
              className={`${inputCls} w-full`}
            />
          </div>
        </div>

        {/* Counters + submit row */}
        <div className="flex gap-2 items-end">
          {/* Adults counter */}
          <div className="shrink-0">
            <label className="text-xs text-charcoal/50 mb-1 block text-center">מבוגרים</label>
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={() => setPax(Math.max(1, pax - 1))}
                className="w-7 h-9 rounded-lg border border-parchment bg-parchment/40 hover:bg-parchment text-charcoal/60 text-base leading-none select-none transition-colors">−</button>
              <input
                type="number" min="1" max="20" value={pax}
                onChange={(e) => setPax(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="w-8 h-9 border border-parchment rounded-lg text-center text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button type="button" onClick={() => setPax(Math.min(20, pax + 1))}
                className="w-7 h-9 rounded-lg border border-parchment bg-parchment/40 hover:bg-parchment text-charcoal/60 text-base leading-none select-none transition-colors">+</button>
            </div>
          </div>

          {/* Children toggle + counter */}
          <div className="shrink-0">
            <label className="text-xs text-charcoal/50 mb-1 block text-center">ילדים</label>
            <div className="flex items-center gap-1.5 h-9">
              <button
                type="button"
                onClick={() => { setChildrenAllowed(v => !v); setChildrenCount(0) }}
                className={[
                  'relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0',
                  childrenAllowed ? 'bg-charcoal' : 'bg-parchment border border-charcoal/20',
                ].join(' ')}
                aria-label="מותר ילדים"
              >
                <span className={[
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                  childrenAllowed ? 'translate-x-4' : 'translate-x-0.5',
                ].join(' ')} />
              </button>
              {childrenAllowed && (
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    className="w-6 h-9 rounded-lg border border-parchment bg-parchment/40 hover:bg-parchment text-charcoal/60 text-base leading-none select-none transition-colors">−</button>
                  <input
                    type="number" min="0" max="20" value={childrenCount}
                    onChange={(e) => setChildrenCount(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                    className="w-8 h-9 border border-parchment rounded-lg text-center text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button type="button" onClick={() => setChildrenCount(Math.min(20, childrenCount + 1))}
                    className="w-6 h-9 rounded-lg border border-parchment bg-parchment/40 hover:bg-parchment text-charcoal/60 text-base leading-none select-none transition-colors">+</button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 bg-charcoal text-cream px-4 py-2 h-9 rounded-lg font-sans font-medium text-sm tracking-wide hover:bg-charcoal-hover active:scale-[0.98] transition-all disabled:opacity-40 select-none whitespace-nowrap"
          >
            {loading ? '...' : '+ הוסף'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {lastGuest && (
        <div className="mt-3 flex items-center gap-2 bg-parchment/50 border border-parchment rounded-lg p-2.5">
          <p className="text-xs text-charcoal/60 flex-1 font-mono truncate" dir="ltr">
            {buildRsvpLink(lastGuest).replace('https://', '')}
          </p>
          <div className="flex gap-1.5">
            {lastGuest.phone && (
              <a href={buildPersonalWhatsAppUrl(lastGuest)} target="_blank" rel="noopener noreferrer"
                className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-100 transition whitespace-nowrap">
                📲 שלח
              </a>
            )}
            <button onClick={copyLink}
              className="text-xs bg-white border border-parchment px-2.5 py-1 rounded-lg hover:bg-parchment transition whitespace-nowrap select-none">
              {copied ? '✓' : 'העתק'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

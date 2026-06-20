'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { signOut } from 'next-auth/react'
import type { Guest } from '@/types'
import SummaryBar from '@/components/admin/SummaryBar'
import GuestTable from '@/components/admin/GuestTable'
import AddGuestForm from '@/components/admin/AddGuestForm'
import CsvUpload from '@/components/admin/CsvUpload'

export type SortCol = 'name' | 'guest_count' | 'rsvp_status' | 'last_activity'

interface Props {
  initialGuests: Guest[]
}

export default function AdminClient({ initialGuests }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortCol>('name')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const queryRef = useRef({ search, sort, order })

  function buildUrl() {
    const q = queryRef.current
    const params = new URLSearchParams()
    if (q.search) params.set('search', q.search)
    params.set('sort', q.sort)
    params.set('order', q.order)
    return `/api/admin/guests?${params.toString()}`
  }

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch(buildUrl())
      if (res.ok) {
        const data = await res.json()
        setGuests(data)
        setLastRefreshed(new Date())
      }
    } catch {}
  }, [])

  // Debounced fetch on search/sort/order change
  useEffect(() => {
    queryRef.current = { search, sort, order }
    const delay = search ? 300 : 0
    const timer = setTimeout(fetchGuests, delay)
    return () => clearTimeout(timer)
  }, [search, sort, order, fetchGuests])

  // Polling interval — always uses latest queryRef
  useEffect(() => {
    let active = true
    const safePoll = async () => {
      if (!active) return
      try {
        const res = await fetch(buildUrl())
        if (res.ok && active) {
          const data = await res.json()
          setGuests(data)
          setLastRefreshed(new Date())
        }
      } catch {}
    }
    const timer = setInterval(safePoll, 10_000)
    return () => { active = false; clearInterval(timer) }
  }, [])

  const poll = useCallback(() => {
    queryRef.current = { search, sort, order }
    fetchGuests()
  }, [search, sort, order, fetchGuests])

  function onSort(col: SortCol) {
    if (col === sort) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(col)
      setOrder('asc')
    }
  }

  function onSortDirect(col: SortCol, ord: 'asc' | 'desc') {
    setSort(col)
    setOrder(ord)
  }

  function handleAdded(guest: Guest) {
    setGuests((prev) => [...prev, guest])
  }

  function handleImported(newGuests: Guest[]) {
    setGuests((prev) => [...prev, ...newGuests])
  }

  function handleUpdated(updated: Guest) {
    setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
  }

  function handleDeleted(guestId: string) {
    setGuests((prev) => prev.filter((g) => g.id !== guestId))
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-light text-charcoal">ניהול הזמנות</h1>
            <p className="text-charcoal/65 text-xs tracking-widest uppercase font-sans mt-1">בריתה מילי ארביב | 3.7.2026</p>
            {lastRefreshed && (
              <p className="text-xs text-charcoal/55 font-sans mt-1">
                עודכן לאחרונה: {lastRefreshed.toLocaleTimeString('he-IL')}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <button onClick={poll} className="text-sm text-charcoal/65 hover:text-charcoal transition ml-3">
              ↻ רענן
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-sm text-charcoal/55 hover:text-charcoal/80 tracking-widest uppercase font-sans transition"
            >
              התנתק
            </button>
          </div>
        </div>

        <SummaryBar guests={guests} />
        <AddGuestForm onAdded={handleAdded} />
        <CsvUpload onImported={handleImported} />
        <input
          type="search"
          dir="rtl"
          placeholder="חיפוש לפי שם..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-black/[0.10] rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-black/20 mb-4"
        />
        <GuestTable guests={guests} sort={sort} order={order} onSort={onSort} onSortDirect={onSortDirect} onUpdated={handleUpdated} onDeleted={handleDeleted} />
      </div>
    </div>
  )
}

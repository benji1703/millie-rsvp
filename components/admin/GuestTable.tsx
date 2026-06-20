'use client'
import React, { useState } from 'react'
import type { Guest } from '@/types'
import type { SortCol } from '@/app/admin/AdminClient'
import { buildWhatsAppUrl, buildFullMessage } from '@/lib/invite'
import { formatActivity, formatAuditTs } from '@/lib/format'

const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין',
  confirmed: 'מגיע',
  declined: 'לא מגיע',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'text-charcoal/60',
  confirmed: 'text-green-600',
  declined: 'text-red-400',
}

const ACTION_LABELS: Record<string, string> = {
  view: 'צפה בהזמנה',
  rsvp_submit: 'אישור RSVP',
  rsvp_update: 'עדכון RSVP',
  admin_status_update: 'עדכון סטטוס (אדמין)',
  admin_edit: 'עריכה (אדמין)',
}

interface AuditEntry {
  id: string
  action: string
  ip_address: string | null
  user_agent: string | null
  previous_status: string | null
  new_status: string | null
  previous_count: number | null
  new_count: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}


interface Props {
  guests: Guest[]
  sort: SortCol
  order: 'asc' | 'desc'
  onSort: (col: SortCol) => void
  onSortDirect: (col: SortCol, order: 'asc' | 'desc') => void
  onUpdated: (guest: Guest) => void
  onDeleted: (guestId: string) => void
}

export default function GuestTable({ guests, sort, order, onSort, onSortDirect, onUpdated, onDeleted }: Props) {
  const [copied, setCopied] = useState<string | null>(null)
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ name: string; phone: string; guestCount: string; childrenAllowed: boolean; childrenCount: string; rsvpStatus: string }>({
    name: '',
    phone: '',
    guestCount: '',
    childrenAllowed: false,
    childrenCount: '0',
    rsvpStatus: 'pending',
  })
  const [saving, setSaving] = useState(false)
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null)
  const [auditData, setAuditData] = useState<Record<string, AuditEntry[]>>({})
  const [auditLoading, setAuditLoading] = useState<string | null>(null)
  const [auditModal, setAuditModal] = useState<string | null>(null)

  function copyLink(guest: Guest) {
    const link = `https://rsvp.arbibe.dev/rsvp/${guest.short_code ?? guest.id}`
    navigator.clipboard.writeText(link)
    setCopied(guest.id)
    setTimeout(() => setCopied(null), 2000)
  }

  function copyMessage(guest: Guest) {
    navigator.clipboard.writeText(buildFullMessage(guest))
    setCopiedMsg(guest.id)
    setTimeout(() => setCopiedMsg(null), 2000)
  }

  function startEdit(guest: Guest) {
    setEditingId(guest.id)
    setEditData({
      name: guest.name,
      phone: guest.phone ?? '',
      guestCount: guest.guest_count?.toString() ?? '',
      childrenAllowed: guest.children_allowed,
      childrenCount: guest.children_count?.toString() ?? '0',
      rsvpStatus: guest.rsvp_status,
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(guest: Guest) {
    if (!editData.name.trim()) return
    setSaving(true)
    const body: Record<string, string | number | boolean> = {}
    if (editData.name.trim() !== guest.name) body.name = editData.name.trim()
    if (editData.phone !== (guest.phone ?? '')) body.phone = editData.phone
    if (editData.guestCount !== (guest.guest_count?.toString() ?? '')) {
      const n = parseInt(editData.guestCount)
      if (!isNaN(n)) body.guest_count = n
    }
    if (editData.childrenAllowed !== guest.children_allowed) body.children_allowed = editData.childrenAllowed
    if (editData.childrenAllowed && editData.childrenCount !== (guest.children_count?.toString() ?? '0')) {
      const n = parseInt(editData.childrenCount)
      if (!isNaN(n)) body.children_count = n
    }
    if (editData.rsvpStatus !== guest.rsvp_status) body.rsvp_status = editData.rsvpStatus

    if (Object.keys(body).length > 0) {
      const res = await fetch(`/api/admin/guests/${guest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated = await res.json()
        onUpdated(updated)
      }
    }
    setSaving(false)
    setEditingId(null)
  }

  async function deleteGuest(guest: Guest) {
    if (!confirm('למחוק את ' + guest.name + '?')) return
    const res = await fetch(`/api/admin/guests/${guest.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDeleted(guest.id)
    }
  }

  async function fetchAudit(guestId: string) {
    if (auditData[guestId]) return
    setAuditLoading(guestId)
    try {
      const res = await fetch(`/api/admin/audit?guestId=${guestId}`)
      const data = res.ok ? await res.json() : []
      setAuditData((prev) => ({ ...prev, [guestId]: data }))
    } catch {
      setAuditData((prev) => ({ ...prev, [guestId]: [] }))
    } finally {
      setAuditLoading(null)
    }
  }

  async function toggleAudit(guestId: string) {
    if (expandedAudit === guestId) { setExpandedAudit(null); return }
    setExpandedAudit(guestId)
    await fetchAudit(guestId)
  }

  function openAuditModal(guestId: string) {
    setAuditModal(guestId)
    fetchAudit(guestId)
  }

  const inputCls = 'input-base'

  function SortIcon({ col }: { col: SortCol }) {
    if (col !== sort) {
      return <span className="text-[8px] text-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity leading-none">↕</span>
    }
    return <span className="text-[9px] text-charcoal/60 leading-none">{order === 'asc' ? '▲' : '▼'}</span>
  }

  const thSortCls = 'cursor-pointer select-none hover:text-charcoal/80 transition-colors group'

  const SORT_OPTIONS: { value: string; label: string; col: SortCol; ord: 'asc' | 'desc' }[] = [
    { value: 'name__asc',           label: 'שם א-ת',            col: 'name',          ord: 'asc'  },
    { value: 'name__desc',          label: 'שם ת-א',            col: 'name',          ord: 'desc' },
    { value: 'guest_count__desc',   label: 'הכי הרבה אורחים',  col: 'guest_count',   ord: 'desc' },
    { value: 'guest_count__asc',    label: 'הכי פחות אורחים',  col: 'guest_count',   ord: 'asc'  },
    { value: 'rsvp_status__asc',    label: 'סטטוס',             col: 'rsvp_status',   ord: 'asc'  },
    { value: 'last_activity__desc', label: 'עדכון אחרון',       col: 'last_activity', ord: 'desc' },
  ]

  /* ── Mobile card list ── */
  const mobileList = (
    <div className="md:hidden space-y-2">
      {/* Sort selector */}
      <div className="flex items-center gap-2 mb-1">
        <label className="text-xs text-charcoal/60 font-sans shrink-0">מיון:</label>
        <select
          dir="rtl"
          value={`${sort}__${order}`}
          onChange={(e) => {
            const opt = SORT_OPTIONS.find(o => o.value === e.target.value)
            if (opt) onSortDirect(opt.col, opt.ord)
          }}
          className="flex-1 text-sm font-sans bg-white border border-black/[0.10] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black/20"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {guests.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center text-charcoal/40 text-sm">עוד לא נוספו אורחים</div>
      )}
      {guests.map((guest) => {
        const isEditing = editingId === guest.id
        return (
          <div key={guest.id} className="bg-white rounded-2xl shadow-sm border border-black/[0.07] overflow-hidden">
            {isEditing ? (
              <div className="p-4 space-y-3">
                <input className={inputCls} value={editData.name} onChange={(e) => setEditData(d => ({ ...d, name: e.target.value }))} placeholder="שם" />
                <input className={inputCls} dir="ltr" value={editData.phone} onChange={(e) => setEditData(d => ({ ...d, phone: e.target.value }))} placeholder="טלפון" />
                <select className={inputCls} value={editData.rsvpStatus} onChange={(e) => setEditData(d => ({ ...d, rsvpStatus: e.target.value }))}>
                  <option value="pending">ממתין</option>
                  <option value="confirmed">מגיע</option>
                  <option value="declined">לא מגיע</option>
                </select>
                <div className="flex gap-2 items-center">
                  <input type="text" inputMode="numeric" pattern="[0-9]*" className={`${inputCls} w-20 text-center`} value={editData.guestCount} onChange={(e) => setEditData(d => ({ ...d, guestCount: e.target.value }))} />
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm text-charcoal/60">
                    <input type="checkbox" checked={editData.childrenAllowed} onChange={(e) => setEditData(d => ({ ...d, childrenAllowed: e.target.checked }))} className="w-4 h-4 accent-charcoal" />
                    ילדים
                  </label>
                  {editData.childrenAllowed && (
                    <input type="text" inputMode="numeric" pattern="[0-9]*" className={`${inputCls} w-20 text-center`} value={editData.childrenCount} onChange={(e) => setEditData(d => ({ ...d, childrenCount: e.target.value }))} />
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(guest)} disabled={saving || !editData.name.trim()} className="flex-1 bg-charcoal text-cream text-sm py-2.5 rounded-xl font-medium disabled:opacity-40">{saving ? '...' : 'שמור'}</button>
                  <button onClick={cancelEdit} className="flex-1 bg-black/[0.06] text-charcoal text-sm py-2.5 rounded-xl">ביטול</button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-base font-medium text-charcoal truncate">{guest.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs font-medium ${STATUS_COLORS[guest.rsvp_status]}`}>{STATUS_LABELS[guest.rsvp_status]}</span>
                      <span className="text-charcoal/20 text-xs">·</span>
                      <span className="text-xs text-charcoal/65">
                        {guest.guest_count ?? '—'} אורחים
                        {guest.children_allowed && <span className="text-charcoal/55"> ({guest.children_count ?? 0} ילדים)</span>}
                      </span>
                      {guest.phone && (
                        <>
                          <span className="text-charcoal/30 text-xs">·</span>
                          <span className="text-xs text-charcoal/65 font-mono" dir="ltr">{guest.phone}</span>
                        </>
                      )}
                      {guest.last_activity_at && (
                        <>
                          <span className="text-charcoal/30 text-xs">·</span>
                          <span className="text-xs text-charcoal/55">עדכון: {formatActivity(guest.last_activity_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openAuditModal(guest.id)} className="p-2 text-charcoal/50 hover:text-charcoal hover:bg-black/[0.05] rounded-lg transition-all" title="היסטוריה">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </button>
                    <button onClick={() => startEdit(guest)} className="p-2 text-charcoal/50 hover:text-charcoal hover:bg-black/[0.05] rounded-lg transition-all">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => deleteGuest(guest)} className="p-2 text-charcoal/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
                <div className="border-t border-black/[0.07] flex">
                  {guest.phone && (
                    <a href={buildWhatsAppUrl(guest)} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors border-l border-black/[0.07]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      וואטסאפ
                    </a>
                  )}
                  <button onClick={() => copyMessage(guest)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-charcoal/65 hover:bg-black/[0.04] transition-colors border-l border-black/[0.07]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {copiedMsg === guest.id ? 'הועתק ✓' : 'הודעה'}
                  </button>
                  <button onClick={() => copyLink(guest)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-charcoal/65 hover:bg-black/[0.04] transition-colors border-l border-black/[0.07]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    {copied === guest.id ? 'הועתק ✓' : 'לינק'}
                  </button>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )

  const modalGuest = auditModal ? guests.find(g => g.id === auditModal) ?? null : null
  const modalEntries = auditModal
    ? [...(auditData[auditModal] ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : []

  return (
    <>
      {mobileList}
      <div className="hidden md:block bg-white border border-black/[0.07] rounded-xl shadow-sm overflow-hidden">
      <table className="table-fixed w-full text-sm">
        <colgroup>
          <col className="w-[19%]" />
          <col className="w-[10%]" />
          <col className="w-[8%]" />
          <col className="w-[15%]" />
          <col className="w-[12%]" />
          <col />
        </colgroup>
        <thead>
          <tr className="bg-black/[0.03] border-b border-black/[0.07]">
            <th onClick={() => onSort('name')} className={`py-2.5 px-3 text-right text-xs font-medium tracking-wide ${sort === 'name' ? 'text-charcoal/80' : 'text-charcoal/70'} ${thSortCls}`}>
              <span className="inline-flex items-center gap-1.5">שם <SortIcon col="name" /></span>
            </th>
            <th className="py-2.5 px-3 text-center text-xs font-medium text-charcoal/70 tracking-wide">טלפון</th>
            <th onClick={() => onSort('rsvp_status')} className={`py-2.5 px-3 text-right text-xs font-medium tracking-wide ${sort === 'rsvp_status' ? 'text-charcoal/80' : 'text-charcoal/70'} ${thSortCls}`}>
              <span className="inline-flex items-center gap-1.5">סטטוס <SortIcon col="rsvp_status" /></span>
            </th>
            <th onClick={() => onSort('guest_count')} className={`py-2.5 px-3 text-right text-xs font-medium tracking-wide ${sort === 'guest_count' ? 'text-charcoal/80' : 'text-charcoal/70'} ${thSortCls}`}>
              <span className="inline-flex items-center gap-1.5 mr-2">אורחים <SortIcon col="guest_count" /></span>
            </th>
            <th onClick={() => onSort('last_activity')} className={`py-2.5 px-3 text-center text-xs font-medium tracking-wide ${sort === 'last_activity' ? 'text-charcoal/80' : 'text-charcoal/70'} ${thSortCls}`}>
              <span className="inline-flex items-center justify-center gap-1.5">עדכון <SortIcon col="last_activity" /></span>
            </th>
            <th className="py-2.5 px-3" />
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => {
            const isEditing = editingId === guest.id
            return (
              <React.Fragment key={guest.id}>
                <tr className="border-b border-black/[0.06] hover:bg-black/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-medium">
                    {isEditing ? (
                      <input
                        className={inputCls}
                        value={editData.name}
                        onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                      />
                    ) : (
                      guest.name
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-charcoal/70 font-mono text-xs text-center" dir="ltr">
                    {isEditing ? (
                      <input
                        className={inputCls}
                        dir="ltr"
                        value={editData.phone}
                        onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))}
                      />
                    ) : (
                      guest.phone ?? '—'
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {isEditing ? (
                      <select
                        className={inputCls}
                        value={editData.rsvpStatus}
                        onChange={(e) => setEditData(d => ({ ...d, rsvpStatus: e.target.value }))}
                      >
                        <option value="pending">ממתין</option>
                        <option value="confirmed">מגיע</option>
                        <option value="declined">לא מגיע</option>
                      </select>
                    ) : (
                      <span className={`font-medium ${STATUS_COLORS[guest.rsvp_status]}`}>{STATUS_LABELS[guest.rsvp_status]}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {isEditing ? (
                      <div className="flex flex-row items-center gap-1.5 justify-end flex-nowrap">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="input-base w-12 text-center"
                          value={editData.guestCount}
                          onChange={(e) => setEditData((d) => ({ ...d, guestCount: e.target.value }))}
                        />
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editData.childrenAllowed}
                            onChange={(e) => setEditData(d => ({ ...d, childrenAllowed: e.target.checked }))}
                            className="w-3 h-3 accent-charcoal"
                          />
                          <span className="text-xs font-sans text-charcoal/50">ילד</span>
                        </label>
                        {editData.childrenAllowed && (
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="input-base w-12 text-center"
                            value={editData.childrenCount}
                            onChange={(e) => setEditData(d => ({ ...d, childrenCount: e.target.value }))}
                          />
                        )}
                      </div>
                    ) : (
                      <span className="mr-2">
                        {guest.guest_count ?? '—'}
                        {guest.children_allowed && (
                          <span className="text-charcoal/60 text-xs"> ({guest.children_count ?? 0})</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-xs text-charcoal/60 font-mono">
                    {formatActivity(guest.last_activity_at ?? null)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1 justify-end items-center">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(guest)}
                            disabled={saving || !editData.name.trim()}
                            className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded hover:bg-green-100 transition disabled:opacity-50"
                          >
                            {saving ? '...' : '✓'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-xs bg-black/[0.05] text-charcoal/70 px-3 py-1 rounded hover:bg-black/[0.09] transition"
                          >
                            ✗
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleAudit(guest.id)}
                            className="p-1.5 text-charcoal/45 hover:text-charcoal hover:bg-black/[0.05] rounded transition-all"
                            title="היסטוריה"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteGuest(guest)}
                            className="p-1.5 text-charcoal/20 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                            title="מחק"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => startEdit(guest)}
                            className="p-1.5 text-charcoal/50 hover:text-charcoal hover:bg-black/[0.05] rounded transition-all"
                            title="ערוך"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          {guest.phone && (
                            <a
                              href={buildWhatsAppUrl(guest)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-sans font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              שלח
                            </a>
                          )}
                          <button
                            onClick={() => copyMessage(guest)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-sans text-charcoal/70 bg-black/[0.04] hover:bg-black/[0.08] transition-colors whitespace-nowrap"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            {copiedMsg === guest.id ? 'הועתק ✓' : 'העתק הודעה'}
                          </button>
                          <button
                            onClick={() => copyLink(guest)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-sans text-charcoal/70 bg-black/[0.04] hover:bg-black/[0.08] transition-colors whitespace-nowrap"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                            {copied === guest.id ? '✓' : 'לינק'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedAudit === guest.id && (() => {
                  const entries = [...(auditData[guest.id] ?? [])].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )
                  return (
                    <tr className="bg-black/[0.02]">
                      <td colSpan={6} className="px-4 pb-3 pt-1">
                        {auditLoading === guest.id ? (
                          <p className="text-xs text-charcoal/65 py-2 font-sans">טוען...</p>
                        ) : entries.length === 0 ? (
                          <p className="text-xs text-charcoal/65 py-2 font-sans">אין פעילות רשומה</p>
                        ) : (
                          <div className="divide-y divide-black/[0.06]">
                            {entries.map((entry) => (
                              <div key={entry.id} className="flex items-center gap-4 py-2 text-xs font-sans">
                                <span className="text-charcoal/60 font-mono w-36 shrink-0">{formatAuditTs(entry.created_at)}</span>
                                <span className="text-charcoal/80 w-28 shrink-0">{ACTION_LABELS[entry.action] ?? entry.action}</span>
                                <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 flex-1">
                                  {entry.previous_status && entry.new_status && (
                                    <span className="flex items-center gap-1.5 text-charcoal/65">
                                      <span className={STATUS_COLORS[entry.previous_status]}>{STATUS_LABELS[entry.previous_status] ?? entry.previous_status}</span>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline shrink-0 text-charcoal/35"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                      <span className={STATUS_COLORS[entry.new_status]}>{STATUS_LABELS[entry.new_status] ?? entry.new_status}</span>
                                    </span>
                                  )}
                                  {entry.previous_count != null && entry.new_count != null && entry.previous_count !== entry.new_count && (
                                    <span className="text-charcoal/65 flex items-center gap-1.5">{entry.previous_count} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline shrink-0 text-charcoal/35"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> {entry.new_count} אורחים</span>
                                  )}
                                  {entry.action === 'admin_edit' && Array.isArray(entry.metadata?.fields) && (
                                    <span className="text-charcoal/60">{(entry.metadata.fields as string[]).join(', ') as string}</span>
                                  )}
                                </span>
                                {entry.ip_address && (
                                  <span className="text-charcoal/50 font-mono text-[10px] shrink-0" dir="ltr">{entry.ip_address}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })()}
              </React.Fragment>
            )
          })}
          {guests.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-charcoal/40">
                עוד לא נוספו אורחים
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {auditModal && modalGuest && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setAuditModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl shadow-2xl overflow-hidden animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.08]">
              <div>
                <h3 className="font-serif text-lg text-charcoal">{modalGuest.name}</h3>
                <p className="text-xs text-charcoal/65 font-sans">יומן פעילות</p>
              </div>
              <button
                onClick={() => setAuditModal(null)}
                className="p-2 text-charcoal/55 hover:text-charcoal hover:bg-black/[0.05] rounded-xl transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {auditLoading === auditModal ? (
                <p className="text-center text-charcoal/65 py-12 text-sm font-sans">טוען...</p>
              ) : modalEntries.length === 0 ? (
                <p className="text-center text-charcoal/65 py-12 text-sm font-sans">אין פעילות רשומה</p>
              ) : (
                <div className="divide-y divide-black/[0.07]">
                  {modalEntries.map((entry) => (
                    <div key={entry.id} className="px-5 py-3.5 flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/50 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm text-charcoal/80 font-medium font-sans">
                            {ACTION_LABELS[entry.action] ?? entry.action}
                          </span>
                          <span className="text-xs text-charcoal/60 font-mono shrink-0 mt-0.5">
                            {formatAuditTs(entry.created_at)}
                          </span>
                        </div>
                        {entry.previous_status && entry.new_status && (
                          <p className="text-xs text-charcoal/70 mt-1 flex items-center gap-1.5">
                            <span className={STATUS_COLORS[entry.previous_status]}>{STATUS_LABELS[entry.previous_status] ?? entry.previous_status}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline shrink-0 text-charcoal/35"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            <span className={STATUS_COLORS[entry.new_status]}>{STATUS_LABELS[entry.new_status] ?? entry.new_status}</span>
                          </p>
                        )}
                        {entry.previous_count != null && entry.new_count != null && entry.previous_count !== entry.new_count && (
                          <p className="text-xs text-charcoal/65 mt-0.5 flex items-center gap-1.5">{entry.previous_count} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline shrink-0 text-charcoal/35"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> {entry.new_count} אורחים</p>
                        )}
                        {entry.action === 'admin_edit' && Array.isArray(entry.metadata?.fields) && (
                          <p className="text-xs text-charcoal/60 mt-0.5">{(entry.metadata.fields as string[]).join(', ') as string}</p>
                        )}
                        {entry.ip_address && (
                          <p className="text-xs text-charcoal/55 font-mono mt-0.5" dir="ltr">{entry.ip_address}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="h-6 bg-white" />
          </div>
        </div>
      )}
    </>
  )
}

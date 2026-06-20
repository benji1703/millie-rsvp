'use client'
import { useRef, useState, useCallback } from 'react'
import Papa from 'papaparse'
import type { Guest } from '@/types'

interface CsvRow { name: string; pax: number; phone: string; childrenAllowed: boolean; childrenCount: number | null }

function parseChildren(val: string): { allowed: boolean; count: number | null } {
  const v = (val ?? '').trim().toLowerCase()
  if (!v || v === 'לא' || v === 'no' || v === 'false') return { allowed: false, count: null }
  const n = parseInt(v)
  if (!isNaN(n) && n > 0) return { allowed: true, count: n }
  return { allowed: true, count: null }
}

function parseCsv(text: string): CsvRow[] {
  const { data } = Papa.parse<string[]>(text, { skipEmptyLines: true })
  const start = data[0]?.[0]?.includes('שם') || data[0]?.[0]?.toLowerCase().includes('name') ? 1 : 0
  return data.slice(start).map((parts) => {
    const { allowed, count } = parseChildren(parts[3] ?? '')
    return {
      name: (parts[0] ?? '').trim(),
      pax: parseInt(parts[1]) || 1,
      phone: (parts[2] ?? '').trim(),
      childrenAllowed: allowed,
      childrenCount: count,
    }
  }).filter((r) => r.name)
}

interface Props { onImported: (guests: Guest[]) => void }

export default function CsvUpload({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<CsvRow[] | null>(null)
  const [dragging, setDragging] = useState(false)

  function processFile(file: File) {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('יש להעלות קובץ CSV בלבד')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const rows = parseCsv(ev.target?.result as string)
      setPreview(rows)
      setError('')
    }
    reader.readAsText(file, 'utf-8')
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  async function handleImport() {
    if (!preview?.length) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/guests/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preview.map((r) => ({
        name: r.name,
        pax: r.pax,
        phone: r.phone,
        children_allowed: r.childrenAllowed,
        children_count: r.childrenCount,
      }))),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'שגיאה בייבוא'); return }
    onImported(data as Guest[])
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="bg-white border border-parchment rounded-xl shadow-paper p-6 mb-6">
      <h2 className="font-serif text-lg font-normal text-charcoal mb-1">ייבוא CSV</h2>
      <p className="text-xs text-charcoal/40 font-sans mb-4 tracking-wide">
        עמודות: שם, מוזמנים, טלפון, ילדים (לא / כן / מספר)
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={[
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 select-none',
          dragging
            ? 'border-gold bg-gold/5 scale-[1.01]'
            : preview
            ? 'border-sage/60 bg-sage/5'
            : 'border-parchment hover:border-gold/40 hover:bg-parchment/30',
        ].join(' ')}
      >
        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleFileInput} className="hidden" />
        {preview ? (
          <div className="flex flex-col items-center gap-1">
            <svg className="text-sage" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p className="text-sm font-sans text-charcoal/70 font-medium">{preview.length} שורות נטענו</p>
            <p className="text-xs text-charcoal/40 font-sans">לחץ להחלפה</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="text-charcoal/30" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-sm font-sans text-charcoal/50">
              {dragging ? 'שחרר כאן' : 'גרור קובץ CSV לכאן או לחץ לבחירה'}
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm font-sans mt-3">{error}</p>}

      {preview && (
        <>
          <div className="mt-3 text-xs text-charcoal/50 font-sans bg-parchment/40 rounded-xl border border-parchment p-3 max-h-32 overflow-y-auto space-y-0.5">
            {preview.slice(0, 8).map((r, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="font-medium text-charcoal/70">{r.name}</span>
                <span className="text-charcoal/30">·</span>
                <span>{r.pax} אורחים</span>
                {r.phone && <><span className="text-charcoal/30">·</span><span dir="ltr">{r.phone}</span></>}
                {r.childrenAllowed && (
                  <>
                    <span className="text-charcoal/30">·</span>
                    <span className="text-sage font-medium">
                      ילדים{r.childrenCount != null ? `: ${r.childrenCount}` : ' ✓'}
                    </span>
                  </>
                )}
              </div>
            ))}
            {preview.length > 8 && <p className="text-charcoal/30 pt-1">ועוד {preview.length - 8}...</p>}
          </div>
          <button
            onClick={handleImport}
            disabled={loading}
            className="btn-primary mt-3 w-full py-3 px-6 disabled:cursor-not-allowed"
          >
            {loading ? 'מייבא...' : `ייבא ${preview.length} אורחים`}
          </button>
        </>
      )}
    </div>
  )
}

function formatJerusalemDate(ts: string, includeSeconds = false): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: false,
  }).formatToParts(new Date(ts))
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  const base = `${get('day')}/${get('month')} ${get('hour')}:${get('minute')}`
  return includeSeconds ? `${base}:${get('second')}` : base
}

export const formatActivity = (ts: string | null): string =>
  ts ? formatJerusalemDate(ts) : '—'

export const formatAuditTs = (ts: string): string =>
  formatJerusalemDate(ts, true)

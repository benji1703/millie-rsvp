export function isNonEmptyString(val: unknown, maxLen = 100): val is string {
  return typeof val === 'string' && val.trim().length > 0 && val.length <= maxLen
}

export function isValidPhone(val: unknown): boolean {
  if (val === undefined || val === '' || val === null) return true
  return typeof val === 'string' && /^[\d\s\-\+]{0,20}$/.test(val)
}

export function isIntInRange(val: unknown, min: number, max: number): val is number {
  return typeof val === 'number' && Number.isInteger(val) && val >= min && val <= max
}

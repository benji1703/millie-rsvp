export function checkCsrf(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (!origin || !host) return true // non-browser clients (curl, Postman) — allow
  try {
    const originHost = new URL(origin).host
    return originHost === host
  } catch {
    return false
  }
}

import { createHash } from 'crypto'

export function shortCodeFromId(id: string): string {
  return createHash('md5').update(id).digest('hex').slice(0, 12)
}

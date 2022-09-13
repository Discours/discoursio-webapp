import type { Stat } from '../graphql/types.gen'

export const byFirstChar = (a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || '')

export const byCreated = (a: any, b: any) => {
  const x = new Date(a?.createdAt)
  const y = new Date(b?.createdAt)

  if (x > y) return -1

  if (x < y) return 1

  return 0
}

export const byLength = (a: any[], b: any[]) => {
  const x = a.length
  const y = b.length

  if (x > y) return -1

  if (x < y) return 1

  return 0
}

// FIXME keyof TopicStat
export const byStat = (metric: keyof Stat) => {
  return (a, b) => {
    const x = (a?.stat && a.stat[metric]) || 0
    const y = (b?.stat && b.stat[metric]) || 0
    if (x > y) return -1
    if (x < y) return 1
    return 0
  }
}

export const sortBy = (data, metric) => {
  const x = [...data]
  x.sort(typeof metric === 'function' ? metric : byStat(metric))
  return x
}

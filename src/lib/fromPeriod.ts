export type FromPeriod = 'week' | 'month' | 'year'

export const getFromDate = (period: FromPeriod): number => {
  const now = new Date()
  let d: Date = now
  switch (period) {
    case 'month': {
      d = new Date(now.setMonth(now.getMonth() - 1))
      break
    }
    case 'year': {
      d = new Date(now.setFullYear(now.getFullYear() - 1))
      break
    }
    default: // 'week'
      d = new Date(now.setDate(now.getDate() - 7))
  }
  return Math.floor(d.getTime() / 1000)
}

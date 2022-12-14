import type { Author, Reaction, Shout, Stat, Topic, TopicStat } from '../graphql/types.gen'

export const byFirstChar = (a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || '')

export const byCreated = (a: Shout | Reaction, b: Shout | Reaction) => {
  const x = new Date(a?.createdAt)
  const y = new Date(b?.createdAt)

  if (x > y) return -1

  if (x < y) return 1

  return 0
}

export const byLength = (
  a: (Shout | Reaction | Topic | Author)[],
  b: (Shout | Reaction | Topic | Author)[]
) => {
  const x = a.length
  const y = b.length

  if (x > y) return -1

  if (x < y) return 1

  return 0
}

export const byStat = (metric: keyof Stat | keyof TopicStat) => {
  return (a, b) => {
    const x = (a?.stat && a.stat[metric]) || 0
    const y = (b?.stat && b.stat[metric]) || 0
    if (x > y) return -1
    if (x < y) return 1
    return 0
  }
}

export const byTopicStatDesc = (metric: keyof TopicStat) => {
  return (a: Topic, b: Topic) => {
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

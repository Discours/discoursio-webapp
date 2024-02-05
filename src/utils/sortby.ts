import type { Author, Reaction, Shout, Stat, Topic, TopicStat } from '../graphql/schema/core.gen'

export const byFirstChar = (a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || '')

export const byCreated = (a: Shout | Reaction, b: Shout | Reaction) => {
  return a?.created_at - b?.created_at
}

export const byPublished = (a: Shout, b: Shout) => {
  return a.published_at - b.published_at
}

export const byLength = (
  a: (Shout | Reaction | Topic | Author)[],
  b: (Shout | Reaction | Topic | Author)[],
) => {
  const x = a.length
  const y = b.length

  if (x > y) return -1

  if (x < y) return 1

  return 0
}

export const byStat = (metric: keyof Stat | keyof TopicStat) => {
  return (a, b) => {
    const x = a.stat?.[metric] || 0
    const y = b.stat?.[metric] || 0
    if (x > y) return -1
    if (x < y) return 1
    return 0
  }
}

export const byTopicStatDesc = (metric: keyof TopicStat) => {
  return (a: Topic, b: Topic) => {
    const x = a.stat?.[metric] || 0
    const y = b.stat?.[metric] || 0
    if (x > y) return -1
    if (x < y) return 1
    return 0
  }
}

export const byScore = () => {
  return (a, b) => {
    const x = a?.score || 0
    const y = b?.score || 0
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

import type { Author, Maybe, Reaction, Shout, Topic, TopicStat } from '~/graphql/schema/core.gen'

export const byFirstChar = (a: { name?: string; title?: string }, b: { name?: string; title?: string }) =>
  (a.name || a.title || '').localeCompare(b.name || b.title || '')

export const byCreated = (a: Shout | Reaction, b: Shout | Reaction) => {
  return a?.created_at - b?.created_at
}

export const byPublished = (a: Shout, b: Shout) => {
  return (a?.published_at || 0) - (b?.published_at || 0)
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

export type SomeStat = { [x: string]: Maybe<number> } | undefined | null

export const byStat = (metric: string) => {
  if (metric === 'name' || metric === 'title') return byFirstChar
  return (a: { stat?: SomeStat }, b: { stat?: SomeStat }) => {
    const aStat = a.stat?.[metric] ?? 0
    const bStat = b.stat?.[metric] ?? 0
    return aStat - bStat
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
  return (a: { score: number }, b: { score: number }) => {
    const x = a?.score || 0
    const y = b?.score || 0
    if (x > y) return -1
    if (x < y) return 1
    return 0
  }
}
// biome-ignore lint/suspicious/noExplicitAny: sort
export const sortBy = (data: any, metric: string | ((a: any, b: any) => number) | undefined) => {
  const x = [...data]
  // @ts-ignore
  x.sort(typeof metric === 'function' ? metric : byStat(metric))
  return x
}

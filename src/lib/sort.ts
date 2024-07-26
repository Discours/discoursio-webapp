import type { Author, Maybe, Reaction, Shout, Topic, TopicStat } from '~/graphql/schema/core.gen'

export const byFirstChar = (a: Author | Topic, b: Author | Topic) =>
  ((a as Author).name || (a as Topic).title || '').localeCompare(
    (b as Author).name || (b as Topic).title || ''
  )

export const byCreated = (a: { created_at?: number }, b: { created_at?: number }) => {
  return (a?.created_at || 0) - (b?.created_at || 0)
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

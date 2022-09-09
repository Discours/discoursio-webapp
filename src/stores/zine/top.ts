// derived solid stores for top lists

import { createSignal } from 'solid-js'
import type { Author, Shout, Topic } from '../../graphql/types.gen'
import { sortBy } from '../../utils/sortby'
import { useTopicsStore } from './topics'

const [topTopics, setTopTopics] = createSignal([] as Topic[])
const [topAuthors, setTopAuthors] = createSignal([] as Author[])
const [topViewed, setTopViewed] = createSignal([] as Shout[])
const [topCommented, setTopCommented] = createSignal([] as Shout[])
const [topReacted, setTopReacted] = createSignal([] as Shout[])
const [topRated, setTopRated] = createSignal([] as Shout[])
const [topRatedMonth, setTopRatedMonth] = createSignal([] as Shout[])
const nowtime = new Date()

export const setTops = async (aaa: Shout[]) => {
  const ta = new Set([] as Author[])
  const tt = {}
  aaa.forEach((s: Shout) => {
    s.topics?.forEach((tpc: Topic) => {
      if (tpc?.slug) tt[tpc.slug] = tpc
    })
    s.authors?.forEach((a: Author) => a && ta.add(a))
  })
  const { getSortedTopics } = useTopicsStore(tt)
  // setTopTopics(getSortedTopics().slice(0, 5)) // fallback
  setTopTopics(sortBy(getSortedTopics(), 'shouts').slice(0, 5)) // test with TopicStat fixed
  setTopAuthors(sortBy([...ta], 'shouts').slice(0, 5)) // TODO: expecting Author's stat metrics
  setTopViewed(sortBy([...aaa], 'viewed').slice(0, 5))
  setTopCommented(sortBy([...aaa], 'commented').slice(0, 5))
  setTopReacted(sortBy([...aaa], 'reacted').slice(0, 5))
  setTopRated(sortBy([...aaa], 'rating').slice(0, 5))
  setTopRatedMonth(
    sortBy(
      [...aaa].filter((a: Shout) => {
        const d = new Date(a.createdAt)
        return (
          d.getFullYear() === nowtime.getFullYear() &&
          (d.getMonth() === nowtime.getMonth() || d.getMonth() === nowtime.getMonth() - 1)
        )
      }),
      'rating'
    )
  )
  console.log('[zine] top lists updated')
}

export { topTopics, topViewed, topCommented, topReacted, topAuthors, topRated, topRatedMonth, setTopRated }

import type { Topic } from '../../graphql/schema/core.gen'

import { createLazyMemo } from '@solid-primitives/memo'
import { createMemo, createSignal } from 'solid-js'

import { apiClient } from '../../graphql/client/core'
import { byTopicStatDesc } from '../../utils/sortby'
import { useRouter } from '../router'

export type TopicsSortBy = 'followers' | 'title' | 'authors' | 'shouts'

const [sortAllBy, setSortAllBy] = createSignal<TopicsSortBy>('shouts')

export const setTopicsSort = (sortBy: TopicsSortBy) => setSortAllBy(sortBy)

const [topicEntities, setTopicEntities] = createSignal<{ [topicSlug: string]: Topic }>({})
const [randomTopics, setRandomTopics] = createSignal<Topic[]>([])

const sortedTopics = createLazyMemo<Topic[]>(() => {
  const topics = Object.values(topicEntities())
  const { changeSearchParams } = useRouter()
  switch (sortAllBy()) {
    case 'followers': {
      // console.debug('[store.topics] sorted by followers')
      topics.sort(byTopicStatDesc('followers'))
      break
    }
    case 'shouts': {
      // log.debug(`sorted by shouts`)
      topics.sort(byTopicStatDesc('shouts'))
      break
    }
    case 'authors': {
      // log.debug(`sorted by authors`)
      topics.sort(byTopicStatDesc('authors'))
      break
    }
    case 'title': {
      // console.debug('[store.topics] sorted by title')
      topics.sort((a, b) => a.title.localeCompare(b.title))
      break
    }
    default: {
      topics.sort(byTopicStatDesc('shouts'))
      changeSearchParams({ by: 'shouts' })
    }
  }

  return topics
})

const topTopics = createMemo(() => {
  const topics = Object.values(topicEntities())
  topics.sort(byTopicStatDesc('shouts'))
  return topics
})

const addTopics = (...args: Topic[][]) => {
  const allTopics = args.flatMap((topics) => (topics || []).filter(Boolean))

  const newTopicEntities = allTopics.reduce(
    (acc, topic) => {
      acc[topic.slug] = topic
      return acc
    },
    {} as Record<string, Topic>,
  )

  setTopicEntities((prevTopicEntities) => {
    return {
      ...prevTopicEntities,
      ...newTopicEntities,
    }
  })
}

export const loadAllTopics = async (): Promise<void> => {
  const topics = await apiClient.getAllTopics()
  addTopics(topics)
}

export const loadRandomTopics = async ({ amount }: { amount: number }): Promise<void> => {
  const topics = await apiClient.getRandomTopics({ amount })
  setRandomTopics(topics)
}

export const loadTopic = async ({ slug }: { slug: string }): Promise<void> => {
  const topic = await apiClient.getTopic({ slug })
  addTopics([topic])
}

type InitialState = {
  topics?: Topic[]
  randomTopics?: Topic[]
  sortBy?: TopicsSortBy
}

export const useTopicsStore = (initialState: InitialState = {}) => {
  if (initialState.sortBy) {
    setSortAllBy(initialState.sortBy)
  }

  addTopics(initialState.topics, initialState.randomTopics)

  if (initialState.randomTopics) {
    setRandomTopics(initialState.randomTopics)
  }

  return { topicEntities, sortedTopics, randomTopics, topTopics }
}

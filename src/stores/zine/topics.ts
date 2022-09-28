import { createMemo, createSignal } from 'solid-js'
import { apiClient } from '../../utils/apiClient'
import type { Topic } from '../../graphql/types.gen'
import { byCreated, byTopicStatDesc } from '../../utils/sortby'
import { getLogger } from '../../utils/logger'

const log = getLogger('topics store')

export type TopicsSortBy = 'created' | 'title' | 'authors' | 'shouts'

const [sortAllBy, setSortAllBy] = createSignal<TopicsSortBy>('shouts')

export { setSortAllBy }

const [topicEntities, setTopicEntities] = createSignal<{ [topicSlug: string]: Topic }>({})
const [randomTopics, setRandomTopics] = createSignal<Topic[]>([])
const [topicsByAuthor, setTopicByAuthor] = createSignal<{ [authorSlug: string]: Topic[] }>({})

const sortedTopics = createMemo(() => {
  const topics = Object.values(topicEntities)
  const sortAllByValue = sortAllBy()

  switch (sortAllByValue) {
    case 'created': {
      // log.debug('sorted by created')
      topics.sort(byCreated)
      break
    }
    case 'shouts':
    case 'authors':
      // log.debug(`sorted by ${sortBy}`)
      topics.sort(byTopicStatDesc(sortAllByValue))
      break
    case 'title':
      // log.debug('sorted by title')
      topics.sort((a, b) => a.title.localeCompare(b.title))
      break
    default:
      log.error(`Unknown sort: ${sortAllByValue}`)
  }
  return topics
})

const topTopics = createMemo(() => {
  const topics = Object.values(topicEntities())
  topics.sort(byTopicStatDesc('shouts'))
  return topics
})

const addTopics = (...args: Topic[][]) => {
  const allTopics = args.flatMap((topics) => topics || [])

  const newTopicEntities = allTopics.reduce((acc, topic) => {
    acc[topic.slug] = topic
    return acc
  }, {} as Record<string, Topic>)

  setTopicEntities((prevTopicEntities) => {
    return {
      ...prevTopicEntities,
      ...newTopicEntities
    }
  })
}

export const addTopicsByAuthor = (newTopicsByAuthors: { [authorSlug: string]: Topic[] }) => {
  const allTopics = Object.values(newTopicsByAuthors).flat()
  addTopics(allTopics)

  setTopicByAuthor((prevTopicsByAuthor) => {
    return Object.entries(newTopicsByAuthors).reduce((acc, [authorSlug, topics]) => {
      if (!acc[authorSlug]) {
        acc[authorSlug] = []
      }

      topics.forEach((topic) => {
        if (!acc[authorSlug].some((t) => t.slug === topic.slug)) {
          acc[authorSlug].push(topic)
        }
      })

      return acc
    }, prevTopicsByAuthor)
  })
}

export const loadAllTopics = async (): Promise<void> => {
  const topics = await apiClient.getAllTopics()
  addTopics(topics)
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

  return { topicEntities, sortedTopics, randomTopics, topTopics, topicsByAuthor }
}

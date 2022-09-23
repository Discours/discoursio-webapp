import { apiClient } from '../../utils/apiClient'
import { map, MapStore, ReadableAtom, atom, computed } from 'nanostores'
import type { Topic } from '../../graphql/types.gen'
import { useStore } from '@nanostores/solid'
import { byCreated, byTopicStatDesc } from '../../utils/sortby'
import { getLogger } from '../../utils/logger'
import { createSignal } from 'solid-js'

const log = getLogger('topics store')

export type TopicsSortBy = 'created' | 'title' | 'authors' | 'shouts'

const sortAllByStore = atom<TopicsSortBy>('shouts')

let topicEntitiesStore: MapStore<Record<string, Topic>>
let sortedTopicsStore: ReadableAtom<Topic[]>
let topTopicsStore: ReadableAtom<Topic[]>

const [getRandomTopics, setRandomTopics] = createSignal<Topic[]>()
let topicsByAuthorStore: MapStore<Record<string, Topic[]>>

const initStore = (initial?: { [topicSlug: string]: Topic }) => {
  if (topicEntitiesStore) {
    return
  }

  topicEntitiesStore = map<Record<string, Topic>>(initial)

  sortedTopicsStore = computed([topicEntitiesStore, sortAllByStore], (topicEntities, sortBy) => {
    const topics = Object.values(topicEntities)
    switch (sortBy) {
      case 'created': {
        // log.debug('sorted by created')
        topics.sort(byCreated)
        break
      }
      case 'shouts':
      case 'authors':
        // log.debug(`sorted by ${sortBy}`)
        topics.sort(byTopicStatDesc(sortBy))
        break
      case 'title':
        // log.debug('sorted by title')
        topics.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        log.error(`Unknown sort: ${sortBy}`)
    }
    return topics
  })

  topTopicsStore = computed(topicEntitiesStore, (topicEntities) => {
    const topics = Object.values(topicEntities)
    topics.sort(byTopicStatDesc('shouts'))
    return topics
  })
}

export const setSortAllTopicsBy = (sortBy: TopicsSortBy) => {
  if (sortAllByStore.get() !== sortBy) {
    sortAllByStore.set(sortBy)
  }
}

const addTopics = (...args: Topic[][]) => {
  const allTopics = args.flatMap((topics) => topics || [])

  const newTopicEntities = allTopics.reduce((acc, topic) => {
    acc[topic.slug] = topic
    return acc
  }, {} as Record<string, Topic>)

  if (!topicEntitiesStore) {
    initStore(newTopicEntities)
  } else {
    topicEntitiesStore.set({
      ...topicEntitiesStore.get(),
      ...newTopicEntities
    })
  }
}

export const addTopicsByAuthor = (topicsByAuthors: { [authorSlug: string]: Topic[] }) => {
  const allTopics = Object.values(topicsByAuthors).flat()
  addTopics(allTopics)

  if (!topicsByAuthorStore) {
    topicsByAuthorStore = map<Record<string, Topic[]>>(topicsByAuthors)
  } else {
    const newState = Object.entries(topicsByAuthors).reduce((acc, [authorSlug, topics]) => {
      if (!acc[authorSlug]) {
        acc[authorSlug] = []
      }

      topics.forEach((topic) => {
        if (!acc[authorSlug].some((t) => t.slug === topic.slug)) {
          acc[authorSlug].push(topic)
        }
      })

      return acc
    }, topicsByAuthorStore.get())

    topicsByAuthorStore.set(newState)
  }
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
  const topics = [...(initialState.topics || [])]
  const randomTopics = [...(initialState.randomTopics || [])]

  if (initialState.sortBy) {
    sortAllByStore.set(initialState.sortBy)
  }

  addTopics(topics, randomTopics)

  if (randomTopics) {
    setRandomTopics(randomTopics)
  }

  const getTopicEntities = useStore(topicEntitiesStore)

  const getSortedTopics = useStore(sortedTopicsStore)

  const getTopTopics = useStore(topTopicsStore)

  return { getTopicEntities, getSortedTopics, getRandomTopics, getTopTopics }
}

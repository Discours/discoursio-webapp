import { apiClient } from '../../utils/apiClient'
import { map, MapStore, ReadableAtom, WritableAtom, atom, computed } from 'nanostores'
import type { Topic } from '../../graphql/types.gen'
import { useStore } from '@nanostores/solid'
import { byCreated, byStat } from '../../utils/sortby'

export type TopicsSortBy = 'created' | 'name'

const sortAllByStore = atom<TopicsSortBy>('created')

let topicEntitiesStore: MapStore<Record<string, Topic>>
let sortedTopicsStore: ReadableAtom<Topic[]>
let topTopicsStore: ReadableAtom<Topic[]>
let randomTopicsStore: WritableAtom<Topic[]>
let topicsByAuthorStore: MapStore<Record<string, Topic[]>>

const initStore = (initial?: Record<string, Topic>) => {
  if (topicEntitiesStore) {
    return
  }

  topicEntitiesStore = map<Record<string, Topic>>(initial)

  sortedTopicsStore = computed([topicEntitiesStore, sortAllByStore], (topicEntities, sortBy) => {
    const topics = Object.values(topicEntities)
    switch (sortBy) {
      case 'created': {
        topics.sort(byCreated)
        break
      }
      // eslint-disable-next-line unicorn/no-useless-switch-case
      case 'name':
      default: {
        // use default sorting abc stores
        console.debug('[topics.store] default sort')
      }
    }
    return topics
  })

  topTopicsStore = computed(topicEntitiesStore, (topicEntities) => {
    const topics = Object.values(topicEntities)
    // DISCUSS
    // topics.sort(byStat('shouts'))
    topics.sort(byStat('rating'))
    return topics
  })
}

export const setSortAllBy = (sortBy: TopicsSortBy) => {
  sortAllByStore.set(sortBy)
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
}

export const useTopicsStore = ({ topics, randomTopics }: InitialState = {}) => {
  // console.log('using topics store')
  if (topics) {
    addTopics(topics)
  }
  if (randomTopics) {
    addTopics(randomTopics)
  }
  if (!randomTopicsStore) {
    randomTopicsStore = atom(randomTopics)
    // console.log('random topics separate store')
  }

  const getTopicEntities = useStore(topicEntitiesStore)
  const getSortedTopics = useStore(sortedTopicsStore)
  const getRandomTopics = useStore(randomTopicsStore)
  const getTopicsByAuthor = useStore(topicsByAuthorStore)
  const getTopTopics = useStore(topTopicsStore)

  return { getTopicEntities, getSortedTopics, getRandomTopics, getTopicsByAuthor, getTopTopics }
}

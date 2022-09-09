import { apiClient } from '../../utils/apiClient'
import type { ReadableAtom, WritableAtom } from 'nanostores'
import { atom, computed } from 'nanostores'
import type { Topic } from '../../graphql/types.gen'
import { useStore } from '@nanostores/solid'
import { byCreated } from '../../utils/sortby'

export type TopicsSortBy = 'created' | 'name'

const sortByStore = atom<TopicsSortBy>('created')

let topicEntitiesStore: WritableAtom<Record<string, Topic>>
let sortedTopicsStore: ReadableAtom<Topic[]>
let randomTopicsStore: WritableAtom<Topic[]>

const initStore = (initial?: Record<string, Topic>) => {
  if (topicEntitiesStore) {
    return
  }

  topicEntitiesStore = atom<Record<string, Topic>>(initial)

  sortedTopicsStore = computed([topicEntitiesStore, sortByStore], (topicEntities, sortBy) => {
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
}

const addTopics = (topics: Topic[] = []) => {
  const newTopicEntities = topics.reduce((acc, topic) => {
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

export const loadAllTopics = async (): Promise<void> => {
  const topics = await apiClient.getAllTopics()
  addTopics(topics)
}

type InitialState = {
  topics?: Topic[]
  randomTopics?: Topic[]
}

export const useTopicsStore = ({ topics, randomTopics }: InitialState) => {
  addTopics(topics)

  // WIP
  if (!randomTopicsStore) {
    randomTopicsStore = atom<Topic[]>(randomTopics)
  }

  const getTopicEntities = useStore(topicEntitiesStore)
  const getSortedTopics = useStore(sortedTopicsStore)
  const getRandomTopics = useStore(randomTopicsStore)
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const getAuthorsByTopic = () => [] // FIXME: useStore(authorsByTopic)
  return { getTopicEntities, getSortedTopics, getRandomTopics, getAuthorsByTopic }
}

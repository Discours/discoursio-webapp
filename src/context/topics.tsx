import { createLazyMemo } from '@solid-primitives/memo'
import { openDB } from 'idb'
import { Accessor, JSX, createContext, createMemo, createSignal, onMount, useContext } from 'solid-js'
import { apiClient } from '../graphql/client/core'
import { Topic } from '../graphql/schema/core.gen'
import { useRouter } from '../stores/router'
import { byTopicStatDesc } from '../utils/sortby'

type TopicsContextType = {
  topicEntities: Accessor<{ [topicSlug: string]: Topic }>
  sortedTopics: Accessor<Topic[]>
  randomTopics: Accessor<Topic[]>
  topTopics: Accessor<Topic[]>
  setTopicsSort: (sortBy: string) => void
  addTopics: (topics: Topic[]) => void
}

const TopicsContext = createContext<TopicsContextType>()
export function useTopics() {
  return useContext(TopicsContext)
}

const DB_NAME = 'discourseAppDB'
const DB_VERSION = 1
const STORE_NAME = 'topics'
const setupIndexedDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })
}

const getTopicsFromIndexedDB = (db) => {
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  return store.getAll()
}
const saveTopicsToIndexedDB = async (db, topics) => {
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  for (const topic of topics) {
    await store.put(topic)
  }
  await tx.done
}

export const TopicsProvider = (props: { children: JSX.Element }) => {
  const [topicEntities, setTopicEntities] = createSignal<{ [topicSlug: string]: Topic }>({})
  const [sortAllBy, setSortAllBy] = createSignal<'shouts' | 'followers' | 'authors' | 'title'>('shouts')
  const [randomTopics, setRandomTopics] = createSignal<Topic[]>([])

  const sortedTopics = createLazyMemo<Topic[]>(() => {
    const topics = Object.values(topicEntities())
    const { changeSearchParams } = useRouter()
    switch (sortAllBy()) {
      case 'followers': {
        topics.sort(byTopicStatDesc('followers'))
        break
      }
      case 'shouts': {
        topics.sort(byTopicStatDesc('shouts'))
        break
      }
      case 'authors': {
        topics.sort(byTopicStatDesc('authors'))
        break
      }
      case 'title': {
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

  onMount(async () => {
    const db = await setupIndexedDB()
    let topics = await getTopicsFromIndexedDB(db)

    if (topics.length < 100) {
      topics = await apiClient.getAllTopics()
      await saveTopicsToIndexedDB(db, topics)
    }
    addTopics(topics)
    setRandomTopics(topics)
  })

  const value: TopicsContextType = {
    setTopicsSort: setSortAllBy,
    topicEntities,
    sortedTopics,
    randomTopics,
    topTopics,
    addTopics,
  }

  return <TopicsContext.Provider value={value}>{props.children}</TopicsContext.Provider>
}

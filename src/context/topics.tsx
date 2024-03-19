import { openDB } from 'idb'
import { Accessor, JSX, createContext, createSignal, onMount, useContext } from 'solid-js'
import { apiClient } from '../graphql/client/core'
import { Topic } from '../graphql/schema/core.gen'

type TopicsContextType = {
  topics: Accessor<Topic[]>
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

const getTopicsFromIndexedDB = async (db) => {
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
  const [randomTopics, setRandomTopics] = createSignal<Topic[]>([])

  onMount(async () => {
    const db = await setupIndexedDB()
    let topics = await getTopicsFromIndexedDB(db)

    if (topics.length === 0) {
      topics = await apiClient.getAllTopics()
      await saveTopicsToIndexedDB(db, topics)
    }
    setRandomTopics(topics)
  })

  const value: TopicsContextType = { topics: randomTopics }

  return <TopicsContext.Provider value={value}>{props.children}</TopicsContext.Provider>
}

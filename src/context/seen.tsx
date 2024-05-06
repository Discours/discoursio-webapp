import { openDB } from 'idb'
import { Accessor, JSX, createContext, createSignal, onMount, useContext } from 'solid-js'

type SeenContextType = {
  seen: Accessor<{ [slug: string]: number }>
  addSeen: (slug: string) => void
}

const SeenContext = createContext<SeenContextType>()
export function useSeen() {
  return useContext(SeenContext)
}

const DB_NAME = 'discourseAppDB'
const DB_VERSION = 1
const STORE_NAME = 'seen'
const setupIndexedDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'slug' })
      }
    },
  })
}

const getSeenFromIndexedDB = async (db) => {
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const seen = await store.getAll()
  return seen.reduce((acc, { slug, date }) => {
    acc[slug] = date
    return acc
  }, {})
}

const saveSeenToIndexedDB = async (db, seen) => {
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  for (const [slug, date] of Object.entries(seen)) {
    await store.put({ slug, date })
  }
  await tx.done
}

export const SeenProvider = (props: { children: JSX.Element }) => {
  const [seen, setSeen] = createSignal<{ [slug: string]: number }>({})
  const [db, setDb] = createSignal()
  const addSeen = async (slug: string) => {
    setSeen((prev) => {
      const newSeen = { ...prev, [slug]: Date.now() }
      saveSeenToIndexedDB(db(), newSeen)
      return newSeen
    })
  }

  onMount(async () => {
    const ndb = await setupIndexedDB()
    setDb(ndb)
    const seenFromDB = await getSeenFromIndexedDB(ndb)
    setSeen(seenFromDB)
  })

  const value: SeenContextType = { seen, addSeen }

  return <SeenContext.Provider value={value}>{props.children}</SeenContext.Provider>
}

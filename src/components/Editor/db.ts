import { openDB } from 'idb'

const dbPromise = () => {
  return openDB('discours.io', 2, {
    upgrade(db) {
      db.createObjectStore('keyval')
    }
  })
}

export default {
  async get(key: string) {
    const result = await dbPromise()
    return result.get('keyval', key)
  },
  async set(key: string, val: string) {
    const result = await dbPromise()
    return result.put('keyval', val, key)
  },
  async delete(key: string) {
    const result = await dbPromise()
    return result.delete('keyval', key)
  },
  async clear() {
    const result = await dbPromise()
    return result.clear('keyval')
  },
  async keys() {
    const result = await dbPromise()
    return result.getAllKeys('keyval')
  }
}

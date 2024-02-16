import { createStorageSignal } from '@solid-primitives/storage'

// TODO: use indexedDB here
export const [seen, setSeen] = createStorageSignal<{ [slug: string]: Date }>('seen', {})
export const addSeen = (slug) => setSeen({ ...seen(), [slug]: Date.now() })

export const useSeenStore = (initialData: { [slug: string]: Date } = {}) => {
  setSeen({ ...seen(), ...initialData })

  return {
    seen,
    setSeen,
    addSeen
  }
}

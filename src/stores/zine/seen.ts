import { createStorageSignal } from '@solid-primitives/storage'

// local stored seen marks by shout's slug
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

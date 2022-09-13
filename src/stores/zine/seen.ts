import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/solid'

const seen = persistentAtom<{ [slug: string]: Date }>(
  'seen',
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse
  }
)

export const addSeen = (slug) => seen.set({ ...seen.get(), [slug]: Date.now() })

export const useSeenStore = () => {
  const getSeen = useStore(seen)
  return { getSeen }
}

import { persistentAtom } from '@nanostores/persistent'
import { action } from 'nanostores'

export const seen = persistentAtom<{ [slug: string]: Date }>(
  'seen',
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse
  }
)

export const addSeen =
  (slug) => action(
    seen,
    'addSeen',
    (s) => s.set({ ...s.get(), [slug]: Date.now() })
  )

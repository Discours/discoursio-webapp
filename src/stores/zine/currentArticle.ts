import { atom, WritableAtom } from 'nanostores'
import type { Shout } from '../../graphql/types.gen'
import { useStore } from '@nanostores/solid'

let currentArticleStore: WritableAtom<Shout | null>

// TODO add author, topic?
export const useCurrentArticleStore = (initialState: Shout) => {
  if (!currentArticleStore) {
    currentArticleStore = atom(initialState)
  }

  const getCurrentArticle = useStore(currentArticleStore)

  return {
    getCurrentArticle
  }
}

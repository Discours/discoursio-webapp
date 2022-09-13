import { atom, WritableAtom } from 'nanostores'
import type { Shout } from '../../graphql/types.gen'
import { useStore } from '@nanostores/solid'

let currentArticleStore: WritableAtom<Shout | null>

type InitialState = {
  currentArticle: Shout
}

export const useCurrentArticleStore = ({ currentArticle }: InitialState) => {
  if (!currentArticleStore) {
    currentArticleStore = atom(currentArticle)
  }

  // FIXME
  // addTopicsByAuthor
  // addAuthorsByTopic

  const getCurrentArticle = useStore(currentArticleStore)

  return {
    getCurrentArticle
  }
}

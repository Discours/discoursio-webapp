import { apiClient } from '../../utils/apiClient'
import type { ReadableAtom, WritableAtom } from 'nanostores'
import { atom, computed } from 'nanostores'
import type { Author } from '../../graphql/types.gen'
import { useStore } from '@nanostores/solid'
import { byCreated } from '../../utils/sortby'

export type AuthorsSortBy = 'created' | 'name'

const sortByStore = atom<AuthorsSortBy>('created')

let authorEntitiesStore: WritableAtom<Record<string, Author>>
let sortedAuthorsStore: ReadableAtom<Author[]>
let authorsByTopicStore: WritableAtom<Record<string, Author[]>>
const initStore = (initial?: Record<string, Author>) => {
  if (authorEntitiesStore) {
    return
  }

  authorEntitiesStore = atom<Record<string, Author>>(initial)

  sortedAuthorsStore = computed([authorEntitiesStore, sortByStore], (authorEntities, sortBy) => {
    const authors = Object.values(authorEntities)
    switch (sortBy) {
      case 'created': {
        authors.sort(byCreated)
        break
      }
      case 'name': {
        // FIXME
        break
      }
    }
    return authors
  })
}

const addAuthors = (authors: Author[]) => {
  const newAuthorEntities = authors.reduce((acc, author) => {
    acc[author.slug] = author
    return acc
  }, {} as Record<string, Author>)

  if (!authorEntitiesStore) {
    initStore(newAuthorEntities)
  } else {
    authorEntitiesStore.set({
      ...authorEntitiesStore.get(),
      ...newAuthorEntities
    })
  }
}

export const loadAllAuthors = async (): Promise<void> => {
  const authors = await apiClient.getAllAuthors()
  addAuthors(authors)
}

export const useAuthorsStore = (initial?: Author[]) => {
  if (initial) addAuthors(initial)

  const getAuthorEntities = useStore(authorEntitiesStore)
  const getSortedAuthors = useStore(sortedAuthorsStore)
  const getAuthorsByTopic = useStore(authorsByTopicStore)
  return { getAuthorEntities, getSortedAuthors, getAuthorsByTopic }
}

import { apiClient } from '../../utils/apiClient'
import type { ReadableAtom, WritableAtom } from 'nanostores'
import { atom, computed } from 'nanostores'
import type { Author } from '../../graphql/types.gen'
import { useStore } from '@nanostores/solid'
import { byCreated, byStat } from '../../utils/sortby'

export type AuthorsSortBy = 'created' | 'name'

const sortByStore = atom<AuthorsSortBy>('created')

let authorEntitiesStore: WritableAtom<{ [authorSlug: string]: Author }>
let authorsByTopicStore: WritableAtom<{ [topicSlug: string]: Author[] }>
let sortedAuthorsStore: ReadableAtom<Author[]>
let topAuthorsStore: ReadableAtom<Author[]>

const initStore = (initial: { [authorSlug: string]: Author }) => {
  if (authorEntitiesStore) {
    return
  }

  authorEntitiesStore = atom(initial)

  sortedAuthorsStore = computed([authorEntitiesStore, sortByStore], (authorEntities, sortBy) => {
    const authors = Object.values(authorEntities)
    switch (sortBy) {
      case 'created': {
        authors.sort(byCreated)
        break
      }
      case 'name': {
        authors.sort((a, b) => a.name.localeCompare(b.name))
        break
      }
    }
    return authors
  })

  topAuthorsStore = computed(authorEntitiesStore, (authorEntities) => {
    // TODO real top authors
    return Object.values(authorEntities)
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

export const addAuthorsByTopic = (authorsByTopic: { [topicSlug: string]: Author[] }) => {
  const allAuthors = Object.values(authorsByTopic).flat()
  addAuthors(allAuthors)

  if (!authorsByTopicStore) {
    authorsByTopicStore = atom<{ [topicSlug: string]: Author[] }>(authorsByTopic)
  } else {
    const newState = Object.entries(authorsByTopic).reduce((acc, [topicSlug, authors]) => {
      if (!acc[topicSlug]) {
        acc[topicSlug] = []
      }

      authors.forEach((author) => {
        if (!acc[topicSlug].some((a) => a.slug === author.slug)) {
          acc[topicSlug].push(author)
        }
      })

      return acc
    }, authorsByTopicStore.get())

    authorsByTopicStore.set(newState)
  }
}

export const loadAllAuthors = async (): Promise<void> => {
  const authors = await apiClient.getAllAuthors()
  addAuthors(authors)
}

type InitialState = {
  authors?: Author[]
}

export const useAuthorsStore = ({ authors }: InitialState = {}) => {
  addAuthors(authors || [])

  const getAuthorEntities = useStore(authorEntitiesStore)
  const getSortedAuthors = useStore(sortedAuthorsStore)
  const getAuthorsByTopic = useStore(authorsByTopicStore)
  const getTopAuthors = useStore(topAuthorsStore)

  return { getAuthorEntities, getSortedAuthors, getAuthorsByTopic, getTopAuthors }
}

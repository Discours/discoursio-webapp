import { apiClient } from '../../utils/apiClient'
import type { Author } from '../../graphql/types.gen'
import { byCreated } from '../../utils/sortby'

import { getLogger } from '../../utils/logger'
import { createMemo, createSignal } from 'solid-js'

const log = getLogger('authors store')

export type AuthorsSortBy = 'created' | 'name'

const [sortAllBy, setSortAllBy] = createSignal<AuthorsSortBy>('created')

const [authorEntities, setAuthorEntities] = createSignal<{ [authorSlug: string]: Author }>({})
const [authorsByTopic, setAuthorsByTopic] = createSignal<{ [topicSlug: string]: Author[] }>({})

const sortedAuthors = createMemo(() => {
  const authors = Object.values(authorEntities())
  switch (sortAllBy()) {
    case 'created': {
      // log.debug('sorted by created')
      authors.sort(byCreated)
      break
    }
    case 'name': {
      // log.debug('sorted by name')
      authors.sort((a, b) => a.name.localeCompare(b.name))
      break
    }
  }
  return authors
})

const addAuthors = (authors: Author[]) => {
  const newAuthorEntities = authors.reduce((acc, author) => {
    acc[author.slug] = author
    return acc
  }, {} as Record<string, Author>)

  setAuthorEntities((prevAuthorEntities) => {
    return {
      ...prevAuthorEntities,
      ...newAuthorEntities
    }
  })
}

export const addAuthorsByTopic = (newAuthorsByTopic: { [topicSlug: string]: Author[] }) => {
  const allAuthors = Object.values(newAuthorsByTopic).flat()
  addAuthors(allAuthors)

  setAuthorsByTopic((prevAuthorsByTopic) => {
    return Object.entries(newAuthorsByTopic).reduce((acc, [topicSlug, authors]) => {
      if (!acc[topicSlug]) {
        acc[topicSlug] = []
      }

      authors.forEach((author) => {
        if (!acc[topicSlug].some((a) => a.slug === author.slug)) {
          acc[topicSlug].push(author)
        }
      })

      return acc
    }, prevAuthorsByTopic)
  })
}

export const loadAllAuthors = async (): Promise<void> => {
  const authors = await apiClient.getAllAuthors()
  addAuthors(authors)
}

type InitialState = {
  authors?: Author[]
}

export const useAuthorsStore = (initialState: InitialState = {}) => {
  addAuthors([...(initialState.authors || [])])

  return { authorEntities, sortedAuthors, authorsByTopic }
}

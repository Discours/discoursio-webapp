import { apiClient } from '../../utils/apiClient'
import type { Author } from '../../graphql/types.gen'
import { createSignal } from 'solid-js'
import { createLazyMemo } from '@solid-primitives/memo'
import { byStat } from '../../utils/sortby'

export type AuthorsSortBy = 'shouts' | 'name' | 'followers'

const [sortAllBy, setSortAllBy] = createSignal<AuthorsSortBy>('shouts')

export const setAuthorsSort = (sortBy: AuthorsSortBy) => setSortAllBy(sortBy)

const [authorEntities, setAuthorEntities] = createSignal<{ [authorSlug: string]: Author }>({})
const [authorsByTopic, setAuthorsByTopic] = createSignal<{ [topicSlug: string]: Author[] }>({})

const sortedAuthors = createLazyMemo(() => {
  const authors = Object.values(authorEntities())
  switch (sortAllBy()) {
    case 'followers': {
      authors.sort(byStat('followers'))
      break
    }
    case 'shouts': {
      authors.sort(byStat('shouts'))
      break
    }
    case 'name': {
      authors.sort((a, b) => a.name.localeCompare(b.name))
      break
    }
  }
  return authors
})

const addAuthors = (authors: Author[]) => {
  const newAuthorEntities = authors.filter(Boolean).reduce((acc, author) => {
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

export const loadAuthor = async ({ slug }: { slug: string }): Promise<void> => {
  const author = await apiClient.getAuthor({ slug })
  addAuthors([author])
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
  sortBy?: AuthorsSortBy
}

export const useAuthorsStore = (initialState: InitialState = {}) => {
  if (initialState.sortBy) {
    setSortAllBy(initialState.sortBy)
  }
  addAuthors([...(initialState.authors || [])])

  return { authorEntities, sortedAuthors, authorsByTopic }
}

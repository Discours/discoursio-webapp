import { createLazyMemo } from '@solid-primitives/memo'
import { createSignal } from 'solid-js'

import { apiClient } from '../../graphql/client/core'
import { Author, QueryLoad_Authors_ByArgs } from '../../graphql/schema/core.gen'

export type AuthorsSortBy = 'shouts' | 'name' | 'followers'
type SortedAuthorsSetter = (prev: Author[]) => Author[]
// FIXME: use signal or remove
const [_sortAllBy, setSortAllBy] = createSignal<AuthorsSortBy>('name')

export const setAuthorsSort = (sortBy: AuthorsSortBy) => setSortAllBy(sortBy)

const [authorEntities, setAuthorEntities] = createSignal<{ [authorSlug: string]: Author }>({})
const [authorsByTopic, setAuthorsByTopic] = createSignal<{ [topicSlug: string]: Author[] }>({})
const [authorsByShouts, setSortedAuthorsByShout] = createSignal<Author[]>([])
const [authorsByFollowers, setSortedAuthorsByFollowers] = createSignal<Author[]>([])

export const setAuthorsByShouts = (authors: SortedAuthorsSetter) => setSortedAuthorsByShout(authors)
export const setAuthorsByFollowers = (authors: SortedAuthorsSetter) => setSortedAuthorsByFollowers(authors)

const sortedAuthors = createLazyMemo(() => {
  return Object.values(authorEntities())
})

export const addAuthors = (authors: Author[]) => {
  const newAuthorEntities = authors.filter(Boolean).reduce(
    (acc, author) => {
      acc[author.slug] = author
      return acc
    },
    {} as Record<string, Author>,
  )

  setAuthorEntities((prevAuthorEntities) =>
    Object.keys(newAuthorEntities).reduce(
      (acc, authorSlug) => {
        acc[authorSlug] = {
          ...acc[authorSlug],
          ...newAuthorEntities[authorSlug],
        }
        return acc
      },
      { ...prevAuthorEntities },
    ),
  )
}

export const loadAuthor = async ({
  slug,
  author_id,
}: {
  slug: string
  author_id?: number
}): Promise<Author> => {
  const author = await apiClient.getAuthor({ slug, author_id })
  addAuthors([author])
  return author
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
        if (!acc[topicSlug].some((a) => a?.slug === author.slug)) {
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

export const loadAuthors = async (args: QueryLoad_Authors_ByArgs): Promise<void> => {
  const authors = await apiClient.loadAuthorsBy(args)
  console.debug(`[load_authors_by] loaded ${Object.keys(authors).length} authors with stat`)
  addAuthors(authors)
}

export const useAuthorsStore = (initialState: InitialState = {}) => {
  if (initialState.sortBy) {
    setSortAllBy(initialState.sortBy)
  }
  addAuthors([...(initialState.authors || [])])

  return { authorEntities, sortedAuthors, authorsByTopic, authorsByShouts, authorsByFollowers }
}

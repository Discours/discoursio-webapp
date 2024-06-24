import {
  Accessor,
  JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  useContext,
} from 'solid-js'
import loadAuthorByQuery from '../graphql/query/core/author-by'
import loadAuthorsAllQuery from '../graphql/query/core/authors-all'
import loadAuthorsByQuery from '../graphql/query/core/authors-load-by'
import { Author, Maybe, QueryLoad_Authors_ByArgs, Shout, Topic } from '../graphql/schema/core.gen'
import { useFeed } from './feed'
import { useGraphQL } from './graphql'

const TOP_AUTHORS_COUNT = 5

type FilterFunction<Author> = (a: Author) => boolean
export type SortFunction<Author> = (a: Author, b: Author) => number

// Универсальная функция фильтрации и сортировки
function filterAndSort<Author>(
  items: Author[],
  sortFunction: SortFunction<Author>,
  filters: FilterFunction<Author>[] = [],
): Author[] {
  return items.filter((a: Author) => filters.every((filter) => filter(a))).sort(sortFunction)
}

type AuthorsContextType = {
  authorsEntities: Accessor<Record<string, Author>>
  authorsSorted: Accessor<Author[]>
  addAuthors: (authors: Author[]) => void
  addAuthor: (author: Author) => void
  loadAuthor: (slug: string) => Promise<void>
  loadAuthors: (args: QueryLoad_Authors_ByArgs) => Promise<void>
  topAuthors: Accessor<Author[]>
  authorsByTopic: Accessor<{ [topicSlug: string]: Author[] }>
  setSortBy: (sortfn: SortFunction<Author>) => void
  loadAllAuthors: () => Promise<Author[]>
}

const AuthorsContext = createContext<AuthorsContextType>({} as AuthorsContextType)

export const useAuthors = () => useContext(AuthorsContext)

export const AuthorsProvider = (props: { children: JSX.Element }) => {
  const [authorsEntities, setAuthors] = createSignal<Record<string, Author>>({})
  const [authorsSorted, setAuthorsSorted] = createSignal<Author[]>([])
  const [sortBy, setSortBy] = createSignal<SortFunction<Author>>()
  const { feedByAuthor } = useFeed()
  const { query } = useGraphQL()

  // Эффект для отслеживания изменений сигнала sortBy и обновления authorsSorted
  createEffect(
    on(
      [sortBy, authorsEntities],
      ([sortfn, authorsdict]) => {
        if (sortfn) {
          setAuthorsSorted([...filterAndSort(Object.values(authorsdict), sortfn)])
        }
      },
      { defer: true },
    ),
  )

  const addAuthors = (newAuthors: Author[]) => {
    setAuthors((prevAuthors) => {
      const updatedAuthors = { ...prevAuthors }
      newAuthors.forEach((author) => {
        updatedAuthors[author.slug] = author
      })
      return updatedAuthors
    })
  }

  const addAuthor = (newAuthor: Author) => {
    setAuthors((prevAuthors) => {
      const updatedAuthors = { ...prevAuthors }
      updatedAuthors[newAuthor.slug] = newAuthor
      return updatedAuthors
    })
  }

  const loadAuthor = async (slug: string): Promise<void> => {
    try {
      const resp = await query(loadAuthorByQuery, { slug }).toPromise()
      if (resp) {
        const author = resp.data.get_author
        if (author?.id) addAuthor(author)
      }
    } catch (error) {
      console.error('Error loading author:', error)
      throw error
    }
  }

  const topAuthors = createMemo(() => {
    const articlesByAuthorMap = feedByAuthor?.() || {}

    // Получаем всех авторов
    const authors = Object.keys(articlesByAuthorMap).map((authorSlug) => ({
      slug: authorSlug,
      rating: articlesByAuthorMap[authorSlug].reduce(
        (acc: number, article: Shout) => acc + (article.stat?.rating || 0),
        0,
      ),
    }))

    // Определяем функцию сортировки по рейтингу
    const sortByRating: SortFunction<{ slug: string; rating: number }> = (a, b) => b.rating - a.rating

    // Фильтруем и сортируем авторов
    const sortedTopAuthors = filterAndSort(authors, sortByRating)
      .slice(0, TOP_AUTHORS_COUNT)
      .map((author) => authorsEntities()[author.slug])
      .filter(Boolean)

    return sortedTopAuthors
  })

  const loadAuthors = async (args: QueryLoad_Authors_ByArgs): Promise<void> => {
    try {
      const resp = await query(loadAuthorsByQuery, { ...args }).toPromise()
      if (resp) {
        const author = resp.data.get_author
        if (author?.id) addAuthor(author)
      }
    } catch (error) {
      console.error('Error loading author:', error)
      throw error
    }
  }

  const authorsByTopic = createMemo(() => {
    const articlesByAuthorMap = feedByAuthor?.() || {}
    const result: { [topicSlug: string]: Author[] } = {}

    Object.values(articlesByAuthorMap).forEach((articles) => {
      articles.forEach((article) => {
        const { authors, topics } = article
        if (topics) {
          topics.forEach((topic: Maybe<Topic>, _index: number, _array: Maybe<Topic>[]) => {
            if (topic) {
              if (!result[topic.slug]) {
                result[topic.slug] = []
              }
              if (authors) {
                authors.forEach((author) => {
                  if (!result[topic.slug].some((a) => a.slug === author?.slug)) {
                    result[topic.slug].push(author as Author)
                  }
                })
              }
            }
          })
        }
      })
    })

    return result
  })

  const loadAllAuthors = async (): Promise<Author[]> => {
    const resp = await query(loadAuthorsAllQuery, {}).toPromise()
    return resp?.data?.get_authors_all || []
  }

  const contextValue: AuthorsContextType = {
    loadAllAuthors,
    authorsEntities,
    authorsSorted,
    addAuthors,
    addAuthor,
    loadAuthor,
    loadAuthors,
    topAuthors,
    authorsByTopic,
    setSortBy,
  }

  return <AuthorsContext.Provider value={contextValue}>{props.children}</AuthorsContext.Provider>
}

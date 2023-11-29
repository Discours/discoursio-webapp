import type {
  Author,
  Shout,
  ShoutInput,
  LoadShoutsOptions,
  QueryLoad_Shouts_SearchArgs,
} from '../../graphql/schema/core.gen'

import { createLazyMemo } from '@solid-primitives/memo'
import { createSignal } from 'solid-js'

import { apiClient } from '../../graphql/client/core'
import { byStat } from '../../utils/sortby'

import { addAuthorsByTopic } from './authors'

const [sortedArticles, setSortedArticles] = createSignal<Shout[]>([])
const [articleEntities, setArticleEntities] = createSignal<{ [articleSlug: string]: Shout }>({})

const [topArticles, setTopArticles] = createSignal<Shout[]>([])
const [topMonthArticles, setTopMonthArticles] = createSignal<Shout[]>([])

const articlesByAuthor = createLazyMemo(() => {
  return Object.values(articleEntities()).reduce(
    (acc, article) => {
      article.authors.forEach((author) => {
        if (!acc[author.slug]) {
          acc[author.slug] = []
        }
        acc[author.slug].push(article)
      })

      return acc
    },
    {} as { [authorSlug: string]: Shout[] },
  )
})

const articlesByTopic = createLazyMemo(() => {
  return Object.values(articleEntities()).reduce(
    (acc, article) => {
      article.topics.forEach((topic) => {
        if (!acc[topic.slug]) {
          acc[topic.slug] = []
        }
        acc[topic.slug].push(article)
      })

      return acc
    },
    {} as { [authorSlug: string]: Shout[] },
  )
})

const articlesByLayout = createLazyMemo(() => {
  return Object.values(articleEntities()).reduce(
    (acc, article) => {
      if (!acc[article.layout]) {
        acc[article.layout] = []
      }

      acc[article.layout].push(article)

      return acc
    },
    {} as { [layout: string]: Shout[] },
  )
})

const topViewedArticles = createLazyMemo(() => {
  const result = Object.values(articleEntities())
  result.sort(byStat('viewed'))
  return result
})

const topCommentedArticles = createLazyMemo(() => {
  const result = Object.values(articleEntities())
  result.sort(byStat('commented'))
  return result
})

// eslint-disable-next-line sonarjs/cognitive-complexity
const addArticles = (...args: Shout[][]) => {
  const allArticles = args.flatMap((articles) => articles || [])

  const newArticleEntities = allArticles.reduce(
    (acc, article) => {
      acc[article.slug] = article
      return acc
    },
    {} as { [articleSLug: string]: Shout },
  )

  setArticleEntities((prevArticleEntities) => {
    return {
      ...prevArticleEntities,
      ...newArticleEntities,
    }
  })

  const authorsByTopic = allArticles.reduce(
    (acc, article) => {
      const { authors, topics } = article

      topics.forEach((topic) => {
        if (!acc[topic.slug]) {
          acc[topic.slug] = []
        }

        authors.forEach((author) => {
          if (!acc[topic.slug].some((a) => a.slug === author.slug)) {
            acc[topic.slug].push(author)
          }
        })
      })

      return acc
    },
    {} as { [topicSlug: string]: Author[] },
  )

  addAuthorsByTopic(authorsByTopic)
}

const addSortedArticles = (articles: Shout[]) => {
  setSortedArticles((prevSortedArticles) => [...prevSortedArticles, ...articles])
}

export const loadShout = async (slug: string): Promise<void> => {
  const newArticle = await apiClient.getShoutBySlug(slug)
  if (!newArticle) {
    return
  }
  addArticles([newArticle])
  const newArticleIndex = sortedArticles().findIndex((s) => s.id === newArticle.id)
  if (newArticleIndex >= 0) {
    const newSortedArticles = [...sortedArticles()]
    newSortedArticles[newArticleIndex] = newArticle
    setSortedArticles(newSortedArticles)
  }
}

export const loadShouts = async (
  options: LoadShoutsOptions,
): Promise<{ hasMore: boolean; newShouts: Shout[] }> => {
  options.limit += 1
  const newShouts = await apiClient.getShouts(options)
  const hasMore = newShouts ?? newShouts.length === options.limit + 1

  if (hasMore) {
    newShouts.splice(-1)
  }

  addArticles(newShouts)
  addSortedArticles(newShouts)

  return { hasMore, newShouts }
}

export const loadMyFeed = async (
  options: LoadShoutsOptions,
): Promise<{ hasMore: boolean; newShouts: Shout[] }> => {
  options.limit += 1
  const newShouts = await apiClient.getMyFeed(options)
  const hasMore = newShouts ?? newShouts.length === options.limit + 1

  if (hasMore) {
    newShouts.splice(-1)
  }

  addArticles(newShouts)
  addSortedArticles(newShouts)

  return { hasMore, newShouts }
}

export const loadShoutsSearch = async (
  options: QueryLoad_Shouts_SearchArgs,
): Promise<{ hasMore: boolean; newShouts: Shout[] }> => {
  options.limit += 1
  const newShouts = await apiClient.getShoutsSearch(options)
  const hasMore = newShouts ?? newShouts.length === options.limit + 1

  if (hasMore) {
    newShouts.splice(-1)
  }

  addArticles(newShouts)
  addSortedArticles(newShouts)

  return { hasMore, newShouts }
}

export const resetSortedArticles = () => {
  setSortedArticles([])
}

export const createArticle = async ({ article }: { article: ShoutInput }) => {
  try {
    await apiClient.createArticle({ article })
  } catch (error) {
    console.error(error)
  }
}

type InitialState = {
  shouts?: Shout[]
}

const TOP_MONTH_ARTICLES_COUNT = 10

export const loadTopMonthArticles = async (): Promise<void> => {
  const daysago = Date.now() - 30 * 24 * 60 * 60 * 1000
  const after = Math.floor(daysago / 1000)
  const options: LoadShoutsOptions = {
    filters: {
      published: true,
      after,
    },
    order_by: 'rating_stat',
    limit: TOP_MONTH_ARTICLES_COUNT,
  }
  const articles = await apiClient.getShouts(options)
  addArticles(articles)
  setTopMonthArticles(articles)
}

const TOP_ARTICLES_COUNT = 10

export const loadTopArticles = async (): Promise<void> => {
  const options: LoadShoutsOptions = {
    filters: { published: true },
    order_by: 'rating_stat',
    limit: TOP_ARTICLES_COUNT,
  }
  const articles = await apiClient.getShouts(options)
  addArticles(articles)
  setTopArticles(articles)
}

export const useArticlesStore = (initialState: InitialState = {}) => {
  addArticles([...(initialState.shouts || [])])

  if (initialState.shouts) {
    setSortedArticles([...initialState.shouts])
  }

  return {
    articleEntities,
    sortedArticles,
    articlesByAuthor,
    articlesByLayout,
    articlesByTopic,
    topMonthArticles,
    topArticles,
    topCommentedArticles,
    topViewedArticles,
  }
}

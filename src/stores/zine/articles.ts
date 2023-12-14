import type { Author, Shout, LoadShoutsOptions } from '../../graphql/types.gen'

import { createLazyMemo } from '@solid-primitives/memo'
import { createSignal } from 'solid-js'

import { apiClient } from '../../utils/apiClient'
import { getServerDate } from '../../utils/getServerDate'
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
  const newShouts = await apiClient.getShouts({
    ...options,
    limit: options.limit + 1,
  })

  const hasMore = newShouts.length === options.limit + 1

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
  const newShouts = await apiClient.getMyFeed({
    ...options,
    limit: options.limit + 1,
  })

  const hasMore = newShouts.length === options.limit + 1

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

type InitialState = {
  shouts?: Shout[]
}

const TOP_MONTH_ARTICLES_COUNT = 10

export const loadTopMonthArticles = async (): Promise<void> => {
  const now = new Date()
  const fromDate = getServerDate(new Date(now.setMonth(now.getMonth() - 1)))

  const articles = await apiClient.getShouts({
    filters: {
      visibility: 'public',
      fromDate,
    },
    order_by: 'rating_stat',
    limit: TOP_MONTH_ARTICLES_COUNT,
  })
  addArticles(articles)
  setTopMonthArticles(articles)
}

const TOP_ARTICLES_COUNT = 10

export const loadTopArticles = async (): Promise<void> => {
  const articles = await apiClient.getShouts({
    filters: {
      visibility: 'public',
    },
    order_by: 'rating_stat',
    limit: TOP_ARTICLES_COUNT,
  })
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

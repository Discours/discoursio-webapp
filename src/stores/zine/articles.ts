import type { Author, Shout, Topic } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { addAuthorsByTopic } from './authors'
import { addTopicsByAuthor } from './topics'
import { byStat } from '../../utils/sortby'

import { getLogger } from '../../utils/logger'
import { createMemo, createSignal } from 'solid-js'

const log = getLogger('articles store')

const [sortedArticles, setSortedArticles] = createSignal<Shout[]>([])
const [articleEntities, setArticleEntities] = createSignal<{ [articleSlug: string]: Shout }>({})

const [topArticles, setTopArticles] = createSignal<Shout[]>([])
const [topMonthArticles, setTopMonthArticles] = createSignal<Shout[]>([])

const articlesByAuthor = createMemo(() => {
  return Object.values(articleEntities()).reduce((acc, article) => {
    article.authors.forEach((author) => {
      if (!acc[author.slug]) {
        acc[author.slug] = []
      }
      acc[author.slug].push(article)
    })

    return acc
  }, {} as { [authorSlug: string]: Shout[] })
})

const articlesByTopic = createMemo(() => {
  return Object.values(articleEntities()).reduce((acc, article) => {
    article.topics.forEach((topic) => {
      if (!acc[topic.slug]) {
        acc[topic.slug] = []
      }
      acc[topic.slug].push(article)
    })

    return acc
  }, {} as { [authorSlug: string]: Shout[] })
})

const articlesByLayout = createMemo(() => {
  return Object.values(articleEntities()).reduce((acc, article) => {
    if (!acc[article.layout]) {
      acc[article.layout] = []
    }

    acc[article.layout].push(article)

    return acc
  }, {} as { [layout: string]: Shout[] })
})

const topViewedArticles = createMemo(() => {
  const result = Object.values(articleEntities())
  result.sort(byStat('viewed'))
  return result
})

const topCommentedArticles = createMemo(() => {
  const result = Object.values(articleEntities())
  result.sort(byStat('commented'))
  return result
})

// eslint-disable-next-line sonarjs/cognitive-complexity
const addArticles = (...args: Shout[][]) => {
  const allArticles = args.flatMap((articles) => articles || [])

  const newArticleEntities = allArticles.reduce((acc, article) => {
    acc[article.slug] = article
    return acc
  }, {} as { [articleSLug: string]: Shout })

  setArticleEntities((prevArticleEntities) => {
    return {
      ...prevArticleEntities,
      ...newArticleEntities
    }
  })

  const authorsByTopic = allArticles.reduce((acc, article) => {
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
  }, {} as { [topicSlug: string]: Author[] })

  addAuthorsByTopic(authorsByTopic)

  const topicsByAuthor = allArticles.reduce((acc, article) => {
    const { authors, topics } = article

    authors.forEach((author) => {
      if (!acc[author.slug]) {
        acc[author.slug] = []
      }

      topics.forEach((topic) => {
        if (!acc[author.slug].some((t) => t.slug === topic.slug)) {
          acc[author.slug].push(topic)
        }
      })
    })

    return acc
  }, {} as { [authorSlug: string]: Topic[] })

  addTopicsByAuthor(topicsByAuthor)
}

const addSortedArticles = (articles: Shout[]) => {
  setSortedArticles((prevSortedArticles) => [...prevSortedArticles, ...articles])
}

export const loadRecentArticles = async ({
  limit,
  offset
}: {
  limit?: number
  offset?: number
}): Promise<void> => {
  const newArticles = await apiClient.getRecentArticles({ limit, offset })
  addArticles(newArticles)
  addSortedArticles(newArticles)
}

export const loadPublishedArticles = async ({
  limit,
  offset
}: {
  limit?: number
  offset?: number
}): Promise<void> => {
  const newArticles = await apiClient.getPublishedArticles({ limit, offset })
  addArticles(newArticles)
  addSortedArticles(newArticles)
}

export const loadTopMonthArticles = async (): Promise<void> => {
  const articles = await apiClient.getTopMonthArticles()
  addArticles(articles)
  setTopMonthArticles(articles)
}

export const loadTopArticles = async (): Promise<void> => {
  const articles = await apiClient.getTopArticles()
  addArticles(articles)
  setTopArticles(articles)
}

export const loadSearchResults = async ({
  query,
  limit,
  offset
}: {
  query: string
  limit?: number
  offset?: number
}): Promise<void> => {
  const newArticles = await apiClient.getSearchResults({ query, limit, offset })
  addArticles(newArticles)
  addSortedArticles(newArticles)
}

export const incrementView = async ({ articleSlug }: { articleSlug: string }): Promise<void> => {
  await apiClient.incrementView({ articleSlug })
}

export const loadArticle = async ({ slug }: { slug: string }): Promise<void> => {
  const article = await apiClient.getArticle({ slug })

  if (!article) {
    throw new Error(`Can't load article, slug: "${slug}"`)
  }

  addArticles([article])
}

type InitialState = {
  sortedArticles?: Shout[]
  topRatedArticles?: Shout[]
  topRatedMonthArticles?: Shout[]
}

export const useArticlesStore = (initialState: InitialState = {}) => {
  addArticles([...(initialState.sortedArticles || [])])

  if (initialState.sortedArticles) {
    setSortedArticles([...initialState.sortedArticles])
  }

  return {
    articleEntities,
    sortedArticles,
    articlesByTopic,
    articlesByAuthor,
    topArticles,
    topMonthArticles,
    topViewedArticles,
    topCommentedArticles,
    articlesByLayout
  }
}

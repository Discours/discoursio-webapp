import { atom, computed, map, ReadableAtom } from 'nanostores'
import type { Author, Shout, Topic } from '../../graphql/types.gen'
import type { WritableAtom } from 'nanostores'
import { useStore } from '@nanostores/solid'
import { apiClient } from '../../utils/apiClient'
import { addAuthorsByTopic } from './authors'
import { addTopicsByAuthor } from './topics'
import { byStat } from '../../utils/sortby'

import { getLogger } from '../../utils/logger'
import { createSignal } from 'solid-js'

const log = getLogger('articles store')

let articleEntitiesStore: WritableAtom<{ [articleSlug: string]: Shout }>
let articlesByAuthorsStore: ReadableAtom<{ [authorSlug: string]: Shout[] }>
let articlesByLayoutStore: ReadableAtom<{ [layout: string]: Shout[] }>
let articlesByTopicsStore: ReadableAtom<{ [topicSlug: string]: Shout[] }>
let topViewedArticlesStore: ReadableAtom<Shout[]>
let topCommentedArticlesStore: ReadableAtom<Shout[]>

const [getSortedArticles, setSortedArticles] = createSignal<Shout[]>([])

const topArticlesStore = atom<Shout[]>()
const topMonthArticlesStore = atom<Shout[]>()

const initStore = (initial?: Record<string, Shout>) => {
  if (articleEntitiesStore) {
    throw new Error('articles store already initialized')
  }

  articleEntitiesStore = map(initial)

  articlesByAuthorsStore = computed(articleEntitiesStore, (articleEntities) => {
    return Object.values(articleEntities).reduce((acc, article) => {
      article.authors.forEach((author) => {
        if (!acc[author.slug]) {
          acc[author.slug] = []
        }
        acc[author.slug].push(article)
      })

      return acc
    }, {} as { [authorSlug: string]: Shout[] })
  })

  articlesByTopicsStore = computed(articleEntitiesStore, (articleEntities) => {
    return Object.values(articleEntities).reduce((acc, article) => {
      article.topics.forEach((topic) => {
        if (!acc[topic.slug]) {
          acc[topic.slug] = []
        }
        acc[topic.slug].push(article)
      })

      return acc
    }, {} as { [authorSlug: string]: Shout[] })
  })

  articlesByLayoutStore = computed(articleEntitiesStore, (articleEntities) => {
    return Object.values(articleEntities).reduce((acc, article) => {
      if (!acc[article.layout]) {
        acc[article.layout] = []
      }

      acc[article.layout].push(article)

      return acc
    }, {} as { [layout: string]: Shout[] })
  })

  topViewedArticlesStore = computed(articleEntitiesStore, (articleEntities) => {
    const sortedArticles = Object.values(articleEntities)
    sortedArticles.sort(byStat('viewed'))
    return sortedArticles
  })

  topCommentedArticlesStore = computed(articleEntitiesStore, (articleEntities) => {
    const sortedArticles = Object.values(articleEntities)
    sortedArticles.sort(byStat('commented'))
    return sortedArticles
  })
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const addArticles = (...args: Shout[][]) => {
  const allArticles = args.flatMap((articles) => articles || [])

  const newArticleEntities = allArticles.reduce((acc, article) => {
    acc[article.slug] = article
    return acc
  }, {} as { [articleSLug: string]: Shout })

  if (!articleEntitiesStore) {
    initStore(newArticleEntities)
  } else {
    articleEntitiesStore.set({
      ...articleEntitiesStore.get(),
      ...newArticleEntities
    })
  }

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
  topMonthArticlesStore.set(articles)
}

export const loadTopArticles = async (): Promise<void> => {
  const articles = await apiClient.getTopArticles()
  addArticles(articles)
  topArticlesStore.set(articles)
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

export const useArticlesStore = ({ sortedArticles }: InitialState = {}) => {
  addArticles(sortedArticles)

  if (sortedArticles) {
    addSortedArticles(sortedArticles)
  }

  const getArticleEntities = useStore(articleEntitiesStore)
  const getTopArticles = useStore(topArticlesStore)
  const getTopMonthArticles = useStore(topMonthArticlesStore)
  const getArticlesByAuthor = useStore(articlesByAuthorsStore)
  const getArticlesByTopic = useStore(articlesByTopicsStore)
  const getArticlesByLayout = useStore(articlesByLayoutStore)
  // TODO: get from server
  const getTopViewedArticles = useStore(topViewedArticlesStore)
  // TODO: get from server
  const getTopCommentedArticles = useStore(topCommentedArticlesStore)

  return {
    getArticleEntities,
    getSortedArticles,
    getArticlesByTopic,
    getArticlesByAuthor,
    getTopArticles,
    getTopMonthArticles,
    getTopViewedArticles,
    getTopCommentedArticles,
    getArticlesByLayout
  }
}

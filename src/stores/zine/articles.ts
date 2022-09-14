import { atom, computed, ReadableAtom } from 'nanostores'
import type { Author, Shout, Topic } from '../../graphql/types.gen'
import type { WritableAtom } from 'nanostores'
import { useStore } from '@nanostores/solid'
import { apiClient } from '../../utils/apiClient'
import { addAuthorsByTopic } from './authors'
import { addTopicsByAuthor } from './topics'
import { byStat } from '../../utils/sortby'

let articleEntitiesStore: WritableAtom<{ [articleSlug: string]: Shout }>
let sortedArticlesStore: WritableAtom<Shout[]>
let topRatedArticlesStore: WritableAtom<Shout[]>
let topRatedMonthArticlesStore: WritableAtom<Shout[]>
let articlesByAuthorsStore: ReadableAtom<{ [authorSlug: string]: Shout[] }>
let articlesByTopicsStore: ReadableAtom<{ [topicSlug: string]: Shout[] }>
let topViewedArticlesStore: ReadableAtom<Shout[]>
let topCommentedArticlesStore: ReadableAtom<Shout[]>

const initStore = (initial?: Record<string, Shout>) => {
  if (articleEntitiesStore) {
    return
  }

  articleEntitiesStore = atom<Record<string, Shout>>(initial)

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
  }, {} as Record<string, Shout>)

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
  if (!sortedArticlesStore) {
    sortedArticlesStore = atom(articles)
    return
  }

  if (articles) {
    sortedArticlesStore.set([...sortedArticlesStore.get(), ...articles])
  }
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

export const loadArticle = async ({ slug }: { slug: string }): Promise<Shout> => {
  return await apiClient.getArticle({ slug })
}

type InitialState = {
  sortedArticles?: Shout[]
  topRatedArticles?: Shout[]
  topRatedMonthArticles?: Shout[]
}

export const useArticlesStore = ({
  sortedArticles,
  topRatedArticles,
  topRatedMonthArticles
}: InitialState = {}) => {
  addArticles(sortedArticles, topRatedArticles, topRatedMonthArticles)
  addSortedArticles(sortedArticles)

  if (!topRatedArticlesStore) {
    topRatedArticlesStore = atom(topRatedArticles)
  } else {
    topRatedArticlesStore.set(topRatedArticles)
  }

  if (!topRatedMonthArticlesStore) {
    topRatedMonthArticlesStore = atom(topRatedMonthArticles)
  } else {
    topRatedMonthArticlesStore.set(topRatedMonthArticles)
  }

  const getArticleEntities = useStore(articleEntitiesStore)
  const getSortedArticles = useStore(sortedArticlesStore)
  const getTopRatedArticles = useStore(topRatedArticlesStore)
  const getTopRatedMonthArticles = useStore(topRatedMonthArticlesStore)
  const getArticlesByAuthor = useStore(articlesByAuthorsStore)
  const getArticlesByTopic = useStore(articlesByTopicsStore)
  // TODO: get from server
  const getTopViewedArticles = useStore(topViewedArticlesStore)
  // TODO: get from server
  const getTopCommentedArticles = useStore(topCommentedArticlesStore)

  return {
    getArticleEntities,
    getSortedArticles,
    getArticlesByTopic,
    getArticlesByAuthor,
    getTopRatedArticles,
    getTopViewedArticles,
    getTopCommentedArticles,
    getTopRatedMonthArticles
  }
}

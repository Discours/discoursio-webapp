import { atom } from 'nanostores'
import type { Shout } from '../../graphql/types.gen'
import type { WritableAtom } from 'nanostores'
import { useStore } from '@nanostores/solid'
import { apiClient } from '../../utils/apiClient'
import { params } from '../router'

let articleEntitiesStore: WritableAtom<Record<string, Shout>>
let sortedArticlesStore: WritableAtom<Shout[]>
let articlesByAuthorsStore: WritableAtom<Record<string, Shout[]>>
let articlesByTopicsStore: WritableAtom<Record<string, Shout[]>>

const initStore = (initial?: Record<string, Shout>) => {
  if (articleEntitiesStore) {
    return
  }

  articleEntitiesStore = atom<Record<string, Shout>>(initial)
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const addArticles = (articles: Shout[]) => {
  const newArticleEntities = articles.reduce((acc, article) => {
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

  if (!sortedArticlesStore) {
    sortedArticlesStore = atom<Shout[]>(articles)
  } else {
    sortedArticlesStore.set([...sortedArticlesStore.get(), ...articles])
  }

  const groupedByAuthors: Record<string, Shout[]> = {}
  const groupedByTopics: Record<string, Shout[]> = {}
  if (!articlesByTopicsStore || !articlesByAuthorsStore) {
    articles.forEach((a) => {
      a.authors.forEach((author) => {
        if (!groupedByAuthors[author.slug]) groupedByAuthors[author.slug] = []
        groupedByAuthors[author.slug].push(a)
      })
      a.topics.forEach((t) => {
        if (!groupedByTopics[t.slug]) groupedByTopics[t.slug] = []
        groupedByTopics[t.slug].push(a)
      })
    })
  }

  if (!articlesByTopicsStore) {
    articlesByTopicsStore = atom<Record<string, Shout[]>>(groupedByTopics)
  } else {
    // TODO: deep update logix needed here
    articlesByTopicsStore.set({ ...articlesByTopicsStore.get(), ...groupedByTopics })
  }

  if (!articlesByAuthorsStore) {
    articlesByAuthorsStore = atom<Record<string, Shout[]>>(groupedByAuthors)
  } else {
    // TODO: deep update logix needed here too
    articlesByAuthorsStore.set({ ...articlesByAuthorsStore.get(), ...groupedByAuthors })
  }
}

export const loadRecentAllArticles = async ({ page }: { page: number }): Promise<void> => {
  const newArticles = await apiClient.getRecentAllArticles({ page, size: 50 })
  addArticles(newArticles)
}

export const loadRecentPublishedArticles = async ({ page }: { page: number }): Promise<void> => {
  const newArticles = await apiClient.getRecentPublishedArticles({ page, size: 50 })
  addArticles(newArticles)
}

type InitialState = {
  sortedArticles?: Shout[]
}

export const useArticlesStore = ({ sortedArticles }: InitialState) => {
  addArticles(sortedArticles)

  const getArticleEntities = useStore(articleEntitiesStore)
  const getSortedArticles = useStore(sortedArticlesStore)
  const getArticlesByAuthors = useStore(articlesByAuthorsStore)
  const getArticlesByTopics = useStore(articlesByTopicsStore)

  return { getArticleEntities, getSortedArticles, getArticlesByTopics, getArticlesByAuthors }
}

export const loadMoreAll = () => {
  const searchParams = useStore(params)
  const pn = Number.parseInt(searchParams()['page'], 10)
  loadRecentAllArticles({ page: pn + 1 })
}

export const loadMorePublished = () => {
  const searchParams = useStore(params)
  const pn = Number.parseInt(searchParams()['page'], 10)
  loadRecentPublishedArticles({ page: pn + 1 })
}

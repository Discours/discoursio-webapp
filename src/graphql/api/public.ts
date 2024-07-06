import { cache } from '@solidjs/router'
import { defaultClient } from '~/context/graphql'
import loadShoutsByQuery from '~/graphql/query/core/articles-load-by'
import loadShoutsSearchQuery from '~/graphql/query/core/articles-load-search'
import getAuthorQuery from '~/graphql/query/core/author-by'
import loadAuthorsAllQuery from '~/graphql/query/core/authors-all'
import loadAuthorsByQuery from '~/graphql/query/core/authors-load-by'
import loadReactionsByQuery from '~/graphql/query/core/reactions-load-by'
import loadTopicsQuery from '~/graphql/query/core/topics-all'
import {
  Author,
  LoadShoutsOptions,
  QueryGet_AuthorArgs,
  QueryGet_ShoutArgs,
  QueryLoad_Authors_ByArgs,
  QueryLoad_Reactions_ByArgs,
  QueryLoad_Shouts_SearchArgs,
  Reaction,
  Shout,
  Topic
} from '~/graphql/schema/core.gen'

export const loadTopics = () =>
  cache(async () => {
    const resp = await defaultClient.query(loadTopicsQuery, {}).toPromise()
    const result = resp?.data?.get_topics_all
    if (result) return result as Topic[]
  }, 'topics')

export const loadAuthors = (options: QueryLoad_Authors_ByArgs) => {
  const page = `${options.offset || 0}-${(options.limit || 0) + (options.offset || 0)}`
  const filter = new URLSearchParams(options.by as Record<string, string>)
  return cache(async () => {
    const resp = await defaultClient.query(loadAuthorsByQuery, { ...options }).toPromise()
    const result = resp?.data?.load_authors_by
    if (result) return result as Author[]
  }, `authors-${filter}-${page}`)
}

export const loadAuthorsAll = () => {
  return cache(async () => {
    const resp = await defaultClient.query(loadAuthorsAllQuery, {}).toPromise()
    const result = resp?.data?.get_authors_all
    if (result) return result as Author[]
  }, 'authors-all')
}

export const loadShouts = (options: LoadShoutsOptions) => {
  const page = `${options.offset || 0}-${options.limit + (options.offset || 0)}`
  const filter = new URLSearchParams(options.filters as Record<string, string>)
  return cache(async () => {
    const resp = await defaultClient.query(loadShoutsByQuery, { options }).toPromise()
    const result = resp?.data?.load_shouts_by
    if (result) return result as Shout[]
  }, `shouts-${filter}-${page}`)
}

export const loadReactions = (options: QueryLoad_Reactions_ByArgs) => {
  const page = `${options.offset || 0}-${(options?.limit || 0) + (options.offset || 0)}`
  const filter = new URLSearchParams(options.by as Record<string, string>)
  return cache(async () => {
    const resp = await defaultClient.query(loadReactionsByQuery, { ...options }).toPromise()
    const result = resp?.data?.load_reactions_by
    if (result) return result as Reaction[]
  }, `reactions-${filter}-${page}`)
}

export const getShout = (options: QueryGet_ShoutArgs) => {
  return cache(
    async () => {
      const resp = await defaultClient.query(loadReactionsByQuery, { ...options }).toPromise()
      const result = resp?.data?.get_shout
      if (result) return result as Shout
    },
    `shout-${options?.slug || ''}`
  )
}

export const getAuthor = (options: QueryGet_AuthorArgs) => {
  return cache(
    async () => {
      const resp = await defaultClient.query(getAuthorQuery, { ...options }).toPromise()
      const result = resp?.data?.get_author
      if (result) return result as Author
    },
    `author-${options?.slug || options?.author_id}`
  )
}

export const loadShoutsSearch = (options: QueryLoad_Shouts_SearchArgs) => {
  const page = `${options.offset || 0}-${(options?.limit || 0) + (options.offset || 0)}`
  return cache(async () => {
    const resp = await defaultClient.query(loadShoutsSearchQuery, { ...options }).toPromise()
    const result = resp?.data?.load_shouts_search
    if (result) return result as Shout[]
  }, `search-${options.text}-${page}`)
}

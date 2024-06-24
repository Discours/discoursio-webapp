import { cache } from '@solidjs/router'
import { defaultClient } from '~/context/graphql'
import loadShoutsByQuery from '~/graphql/query/core/articles-load-by'
import loadAuthorsByQuery from '~/graphql/query/core/authors-load-by'
import loadTopicsQuery from '~/graphql/query/core/topics-all'
import {
  Author,
  LoadShoutsOptions,
  QueryLoad_Authors_ByArgs,
  Shout,
  Topic,
} from '~/graphql/schema/core.gen'

export const loadTopics = () =>
  cache(async () => {
    const resp = await defaultClient.query(loadTopicsQuery, {}).toPromise()
    const result = resp?.data?.get_topics_all as Topic[]
    if (result) return result
  }, 'topics')

export const loadAuthors = (options: QueryLoad_Authors_ByArgs) => {
  const page = `${options.offset || 0}-${(options.limit || 0) + (options.offset || 0)}`
  const filter = new URLSearchParams(options.by as Record<string, string>)
  return cache(async () => {
    const resp = await defaultClient.query(loadAuthorsByQuery, { ...options }).toPromise()
    const result = resp?.data?.load_shouts_by as Author[]
    if (result) return result
  }, `authors-${filter}-${page}`)
}

export const loadShouts = (options: LoadShoutsOptions) => {
  const page = `${options.offset || 0}-${options.limit + (options.offset || 0)}`
  const filter = new URLSearchParams(options.filters as Record<string, string>)
  return cache(async () => {
    const resp = await defaultClient.query(loadShoutsByQuery, { options }).toPromise()
    const result = resp?.data?.load_shouts_by as Shout[]
    if (result) return result
  }, `shouts-${filter}-${page}`)
}

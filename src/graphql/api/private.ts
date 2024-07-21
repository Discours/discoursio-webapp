import { cache } from '@solidjs/router'
import { Client } from '@urql/core'
import loadShoutsBookmarkedQuery from '~/graphql/query/core/articles-load-bookmarked'
import loadShoutsCoauthoredQuery from '~/graphql/query/core/articles-load-coauthored'
import loadShoutsDiscussedQuery from '~/graphql/query/core/articles-load-discussed'
import loadShoutsFollowedQuery from '~/graphql/query/core/articles-load-followed'
import loadShoutsUnratedQuery from '~/graphql/query/core/articles-load-unrated'

import {
  QueryLoad_Shouts_FollowedArgs,
  QueryLoad_Shouts_UnratedArgs,
  Shout
} from '~/graphql/schema/core.gen'

export const loadUnratedShouts = (
  signedClient: Client | undefined,
  options: QueryLoad_Shouts_UnratedArgs
) => {
  const page = `${options.offset || 0}-${(options?.limit || 0) + (options.offset || 0)}`
  return cache(async () => {
    const resp = await signedClient?.query(loadShoutsUnratedQuery, { ...options }).toPromise()
    const result = resp?.data?.load_shouts_unrated
    if (result) return result as Shout[]
  }, `shouts-unrated-${page}`)
}

export const loadFollowedShouts = (
  signedClient: Client | undefined,
  options: QueryLoad_Shouts_FollowedArgs
) => {
  const page = `${options.offset || 0}-${(options?.limit || 0) + (options.offset || 0)}`
  return cache(async () => {
    const resp = await signedClient?.query(loadShoutsFollowedQuery, { ...options }).toPromise()
    const result = resp?.data?.load_shouts_followed
    if (result) return result as Shout[]
  }, `shouts-followed-${page}`)
}

export const loadBookmarkedShouts = (
  signedClient: Client | undefined,
  options: QueryLoad_Shouts_FollowedArgs
) => {
  const page = `${options.offset || 0}-${(options?.limit || 0) + (options.offset || 0)}`
  return cache(async () => {
    const resp = await signedClient?.query(loadShoutsBookmarkedQuery, { ...options }).toPromise()
    const result = resp?.data?.load_shouts_bookmarked
    if (result) return result as Shout[]
  }, `shouts-bookmarked-${page}`)
}

export const loadDiscussedShouts = (
  signedClient: Client | undefined,
  options: QueryLoad_Shouts_FollowedArgs
) => {
  const page = `${options.offset || 0}-${(options?.limit || 0) + (options.offset || 0)}`
  return cache(async () => {
    const resp = await signedClient?.query(loadShoutsDiscussedQuery, { ...options }).toPromise()
    const result = resp?.data?.load_shouts_discussed
    if (result) return result as Shout[]
  }, `shouts-discussed-${page}`)
}

export const loadCoauthoredShouts = (
  signedClient: Client | undefined,
  options: QueryLoad_Shouts_FollowedArgs
) => {
  const page = `${options.offset || 0}-${(options?.limit || 0) + (options.offset || 0)}`
  return cache(async () => {
    const resp = await signedClient?.query(loadShoutsCoauthoredQuery, { ...options }).toPromise()
    const result = resp?.data?.load_shouts_coauthored
    if (result) return result as Shout[]
  }, `shouts-coauthored-${page}`)
}

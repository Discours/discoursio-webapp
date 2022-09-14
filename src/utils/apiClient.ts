import type { Reaction, Shout, FollowingEntity } from '../graphql/types.gen'

import { publicGraphQLClient } from '../graphql/publicGraphQLClient'
import articleBySlug from '../graphql/query/article-by-slug'
import articleReactions from '../graphql/query/article-reactions'
import articlesRecentAll from '../graphql/query/articles-recent-all'
import articlesRecentPublished from '../graphql/query/articles-recent-published'
import topicsAll from '../graphql/query/topics-all'
import { getLogger } from './logger'
import reactionsForShouts from '../graphql/query/reactions-for-shouts'
import mySession from '../graphql/mutation/my-session'
import { privateGraphQLClient } from '../graphql/privateGraphQLClient'
import authLogout from '../graphql/mutation/auth-logout'
import authLogin from '../graphql/query/auth-login'
import authRegister from '../graphql/mutation/auth-register'
import followMutation from '../graphql/mutation/follow'
import unfollowMutation from '../graphql/mutation/unfollow'
import articlesForAuthors from '../graphql/query/articles-for-authors'
import articlesForTopics from '../graphql/query/articles-for-topics'
import searchResults from '../graphql/query/search-results'
import topicsRandomQuery from '../graphql/query/topics-random'
import articlesTopMonth from '../graphql/query/articles-top-month'
import articlesTopRated from '../graphql/query/articles-top-rated'
import authorsAll from '../graphql/query/authors-all'
import reactionCreate from '../graphql/mutation/reaction-create'
import reactionDestroy from '../graphql/mutation/reaction-destroy'
import reactionUpdate from '../graphql/mutation/reaction-update'
import authCheck from '../graphql/query/auth-check'
import authReset from '../graphql/mutation/auth-reset'
import authForget from '../graphql/mutation/auth-forget'
import authResend from '../graphql/mutation/auth-resend'
import authorsBySlugs from '../graphql/query/authors-by-slugs'
import incrementView from '../graphql/mutation/increment-view'

const log = getLogger('api-client')

const FEED_SIZE = 50
const REACTIONS_PAGE_SIZE = 100
const DEFAULT_RANDOM_TOPICS_AMOUNT = 12

export const apiClient = {
  getTopArticles: async () => {
    const response = await publicGraphQLClient.query(articlesTopRated, { limit: 10, offset: 0 }).toPromise()
    return response.data.topOverall
  },
  getTopMonthArticles: async () => {
    const response = await publicGraphQLClient.query(articlesTopMonth, { limit: 10, offset: 0 }).toPromise()
    return response.data.topMonth
  },
  getRecentPublishedArticles: async ({
    limit = FEED_SIZE,
    offset = 0
  }: {
    limit?: number
    offset?: number
  }) => {
    const response = await publicGraphQLClient.query(articlesRecentPublished, { limit, offset }).toPromise()

    return response.data.recentPublished
  },
  getRandomTopics: async () => {
    const response = await publicGraphQLClient
      .query(topicsRandomQuery, { amount: DEFAULT_RANDOM_TOPICS_AMOUNT })
      .toPromise()

    return response.data.topicsRandom
  },
  getSearchResults: async ({
    query,
    limit = FEED_SIZE,
    offset = 0
  }: {
    query: string
    limit: number
    offset: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(searchResults, {
        q: query,
        limit,
        offset
      })
      .toPromise()

    return response.data?.searchQuery || []
  },
  getRecentArticles: async ({
    limit = FEED_SIZE,
    offset = 0
  }: {
    limit: number
    offset: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(articlesRecentAll, {
        limit,
        offset
      })
      .toPromise()

    return response.data.recentAll
  },
  getArticlesForTopics: async ({
    topicSlugs,
    limit = FEED_SIZE,
    offset = 0
  }: {
    topicSlugs: string[]
    limit: number
    offset: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(articlesForTopics, {
        slugs: topicSlugs,
        limit,
        offset
      })
      .toPromise()

    return response.data.shoutsByTopics
  },
  getArticlesForAuthors: async ({
    authorSlugs,
    limit = FEED_SIZE,
    offset = 0
  }: {
    authorSlugs: string[]
    limit: number
    offset: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(articlesForAuthors, {
        slugs: authorSlugs,
        limit,
        offset
      })
      .toPromise()

    return response.data.shoutsByAuthors
  },

  // subscribe

  follow: async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
    const response = await privateGraphQLClient.query(followMutation, { what, slug }).toPromise()
    return response.data.follow
  },
  unfollow: async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
    const response = await privateGraphQLClient.query(unfollowMutation, { what, slug }).toPromise()
    return response.data.unfollow
  },

  // auth

  signIn: async ({ email, password }) => {
    const response = await publicGraphQLClient.query(authLogin, { email, password }).toPromise()
    return response.data.signIn
  },
  signUp: async ({ email, password }) => {
    const response = await publicGraphQLClient.query(authRegister, { email, password }).toPromise()
    return response.data.registerUser
  },
  signOut: async () => {
    const response = await publicGraphQLClient.query(authLogout, {}).toPromise()
    return response.data.signOut
  },
  signCheck: async ({ email }) => {
    // check if email is used
    const response = await publicGraphQLClient.query(authCheck, { email }).toPromise()
    return response.data.isEmailUsed
  },
  signReset: async ({ email }) => {
    // send reset link with code on email
    const response = await publicGraphQLClient.query(authForget, { email }).toPromise()
    return response.data.reset
  },
  signResend: async ({ email }) => {
    // same as reset if code is expired
    const response = await publicGraphQLClient.query(authResend, { email }).toPromise()
    return response.data.resend
  },
  signResetConfirm: async ({ code }) => {
    // confirm reset password with code
    const response = await publicGraphQLClient.query(authReset, { code }).toPromise()
    return response.data.reset
  },
  getSession: async () => {
    // renew session with auth token in header (!)
    const response = await privateGraphQLClient.mutation(mySession, {}).toPromise()
    return response.data.refreshSession
  },
  getPublishedArticles: async ({ limit = FEED_SIZE, offset }: { limit?: number; offset?: number }) => {
    const response = await publicGraphQLClient.query(articlesRecentPublished, { limit, offset }).toPromise()

    return response.data.recentPublished
  },
  getAllTopics: async () => {
    const response = await publicGraphQLClient.query(topicsAll, {}).toPromise()
    return response.data.topicsAll
  },

  getAllAuthors: async () => {
    const response = await publicGraphQLClient.query(authorsAll, { limit: 9999, offset: 9999 }).toPromise()
    return response.data.authorsAll
  },
  getArticle: async ({ slug }: { slug: string }): Promise<Shout> => {
    const response = await publicGraphQLClient.query(articleBySlug, { slug }).toPromise()

    return response.data?.getShoutBySlug
  },

  // reactions

  getReactionsForShouts: async ({
    shoutSlugs,
    limit = FEED_SIZE,
    offset = 0
  }: {
    shoutSlugs: string[]
    limit?: number
    offset?: number
  }): Promise<Reaction[]> => {
    const response = await publicGraphQLClient
      .query(reactionsForShouts, {
        shouts: shoutSlugs,
        limit,
        offset
      })
      .toPromise()

    return response.data.reactionsByShout
  },
  getArticleReactions: async ({
    articleSlug,
    limit = REACTIONS_PAGE_SIZE,
    offset = 0
  }: {
    articleSlug: string
    limit: number
    offset: number
  }): Promise<Reaction[]> => {
    const response = await publicGraphQLClient
      .query(articleReactions, {
        slug: articleSlug,
        limit,
        offset
      })
      .toPromise()

    return response.data.reactionsByShout
  },
  getAuthorsBySlugs: async ({ slugs }) => {
    const response = await publicGraphQLClient.query(authorsBySlugs, { slugs }).toPromise()
    return response.data.getUsersBySlugs
  },
  createReaction: async ({ reaction }) => {
    const response = await privateGraphQLClient.mutation(reactionCreate, { reaction }).toPromise()
    log.debug('[api] create reaction mutation called')
    return response.data.createReaction
  },
  updateReaction: async ({ reaction }) => {
    const response = await privateGraphQLClient.mutation(reactionUpdate, { reaction }).toPromise()

    return response.data.createReaction
  },
  destroyReaction: async ({ id }) => {
    const response = await privateGraphQLClient.mutation(reactionDestroy, { id }).toPromise()

    return response.data.deleteReaction
  },
  incrementView: async ({ articleSlug }) => {
    await privateGraphQLClient.mutation(incrementView, { shout: articleSlug })
  }
}

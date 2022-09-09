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
import { GRAPHQL_MAX_INT } from 'graphql/type'
import reactionCreate from '../graphql/mutation/reaction-create'
import reactionDestroy from '../graphql/mutation/reaction-destroy'
import reactionUpdate from '../graphql/mutation/reaction-update'
// import authorsBySlugs from '../graphql/query/authors-by-slugs'
import authLogin from '../graphql/query/auth-login'
import authCheck from '../graphql/query/auth-check'
import authReset from '../graphql/mutation/auth-reset'
import authForget from '../graphql/mutation/auth-forget'
import authResend from '../graphql/mutation/auth-resend'

const log = getLogger('api-client')
const FEED_PAGE_SIZE = 50
const REACTIONS_PAGE_SIZE = 100

export const apiClient = {
  getTopArticles: async () => {
    const response = await publicGraphQLClient.query(articlesTopRated, { page: 1, size: 10 }).toPromise()
    return response.data.topOverall
  },
  getTopMonthArticles: async () => {
    const response = await publicGraphQLClient.query(articlesTopMonth, { page: 1, size: 10 }).toPromise()
    return response.data.articlesTopMonth
  },
  getRandomTopics: async () => {
    const response = await publicGraphQLClient.query(topicsRandomQuery, {}).toPromise()

    return response.data.topicsRandom
  },
  getSearchResults: async ({
    query,
    page = 1,
    size = FEED_PAGE_SIZE
  }: {
    query: string
    page?: number
    size?: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(searchResults, {
        q: query,
        page,
        size
      })
      .toPromise()

    return response.data.searchQuery
  },
  getRecentAllArticles: async ({
    page = 1,
    size = FEED_PAGE_SIZE
  }: {
    page?: number
    size?: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(articlesRecentAll, {
        page,
        size
      })
      .toPromise()

    return response.data.recentAll
  },
  getRecentPublishedArticles: async ({
    page = 1,
    size = FEED_PAGE_SIZE
  }: {
    page?: number
    size?: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(articlesRecentPublished, {
        page,
        size
      })
      .toPromise()

    return response.data.recentPublished
  },
  getArticlesForTopics: async ({
    topicSlugs,
    page = 1,
    size = FEED_PAGE_SIZE
  }: {
    topicSlugs: string[]
    page?: number
    size?: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(articlesForTopics, {
        slugs: topicSlugs,
        page,
        size
      })
      .toPromise()

    return response.data.shoutsByTopics
  },
  getArticlesForAuthors: async ({
    authorSlugs,
    page = 1,
    size = FEED_PAGE_SIZE
  }: {
    authorSlugs: string[]
    page?: number
    size?: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(articlesForAuthors, {
        slugs: authorSlugs,
        page,
        size
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

  // feeds
  getAllTopics: async () => {
    const response = await publicGraphQLClient.query(topicsAll, {}).toPromise()
    return response.data.topicsAll
  },

  getAllAuthors: async () => {
    const response = await publicGraphQLClient
      .query(authorsAll, { page: 1, size: GRAPHQL_MAX_INT })
      .toPromise()
    return response.data.authorsAll
  },
  getArticle: async ({ slug }: { slug: string }): Promise<Shout> => {
    const response = await publicGraphQLClient.query(articleBySlug, { slug }).toPromise()

    return response.data?.getShoutBySlug
  },

  // reactions

  getReactionsForShouts: async ({
    shoutSlugs,
    page = 1,
    size = REACTIONS_PAGE_SIZE
  }: {
    shoutSlugs: string[]
    page?: number
    size?: number
  }): Promise<Reaction[]> => {
    const response = await publicGraphQLClient
      .query(reactionsForShouts, {
        shouts: shoutSlugs,
        page,
        size
      })
      .toPromise()

    return response.data.reactionsByShout
  },
  getArticleReactions: async ({
    articleSlug,
    page,
    size
  }: {
    articleSlug: string
    page: number
    size: number
  }): Promise<Reaction[]> => {
    const response = await publicGraphQLClient
      .query(articleReactions, {
        slug: articleSlug,
        page,
        size
      })
      .toPromise()

    return response.data.reactionsByShout
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
  }
}

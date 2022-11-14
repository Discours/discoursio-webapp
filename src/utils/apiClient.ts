import type {
  Reaction,
  Shout,
  FollowingEntity,
  AuthResult,
  ShoutInput,
  Topic,
  Author
} from '../graphql/types.gen'
import { publicGraphQLClient } from '../graphql/publicGraphQLClient'
import { getToken, privateGraphQLClient } from '../graphql/privateGraphQLClient'
import articleBySlug from '../graphql/query/article-by-slug'
import articlesRecentAll from '../graphql/query/articles-recent-all'
import articlesRecentPublished from '../graphql/query/articles-recent-published'
import topicsAll from '../graphql/query/topics-all'
import reactionsForShouts from '../graphql/query/reactions-for-shouts'
import mySession from '../graphql/mutation/my-session'
import authLogoutQuery from '../graphql/mutation/auth-logout'
import authLoginQuery from '../graphql/query/auth-login'
import authRegisterMutation from '../graphql/mutation/auth-register'
import authCheckEmailQuery from '../graphql/query/auth-check-email'
import authConfirmEmailMutation from '../graphql/mutation/auth-confirm-email'
import authSendLinkMutation from '../graphql/mutation/auth-send-link'
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
import incrementView from '../graphql/mutation/increment-view'
import createArticle from '../graphql/mutation/article-create'
import myChats from '../graphql/query/my-chats'
import authorBySlug from '../graphql/query/author-by-slug'
import topicBySlug from '../graphql/query/topic-by-slug'

const FEED_SIZE = 50

type ApiErrorCode =
  | 'unknown'
  | 'email_not_confirmed'
  | 'user_not_found'
  | 'user_already_exists'
  | 'token_expired'
  | 'token_invalid'

export class ApiError extends Error {
  code: ApiErrorCode

  constructor(code: ApiErrorCode, message?: string) {
    super(message)
    this.code = code
  }
}

export const apiClient = {
  authLogin: async ({ email, password }: { email: string; password: string }): Promise<AuthResult> => {
    const response = await publicGraphQLClient.query(authLoginQuery, { email, password }).toPromise()
    // console.debug('[api-client] authLogin', { response })
    if (response.error) {
      if (response.error.message === '[GraphQL] User not found') {
        throw new ApiError('user_not_found')
      }

      throw new ApiError('unknown', response.error.message)
    }

    if (response.data.signIn.error) {
      if (response.data.signIn.error === 'please, confirm email') {
        throw new ApiError('email_not_confirmed')
      }

      throw new ApiError('unknown', response.data.signIn.error)
    }

    return response.data.signIn
  },
  authRegister: async ({
    email,
    password,
    name
  }: {
    email: string
    password: string
    name: string
  }): Promise<void> => {
    const response = await publicGraphQLClient
      .mutation(authRegisterMutation, { email, password, name })
      .toPromise()

    if (response.error) {
      if (response.error.message === '[GraphQL] User already exist') {
        throw new ApiError('user_already_exists', response.error.message)
      }

      throw new ApiError('unknown', response.error.message)
    }
  },
  authSignOut: async () => {
    const response = await publicGraphQLClient.query(authLogoutQuery, {}).toPromise()
    return response.data.signOut
  },
  authCheckEmail: async ({ email }) => {
    // check if email is used
    const response = await publicGraphQLClient.query(authCheckEmailQuery, { email }).toPromise()
    return response.data.isEmailUsed
  },
  authSendLink: async ({ email, lang }) => {
    // send link with code on email
    const response = await publicGraphQLClient.mutation(authSendLinkMutation, { email, lang }).toPromise()

    if (response.error) {
      if (response.error.message === '[GraphQL] User not found') {
        throw new ApiError('user_not_found', response.error.message)
      }

      throw new ApiError('unknown', response.error.message)
    }

    if (response.data.sendLink.error) {
      throw new ApiError('unknown', response.data.sendLink.message)
    }

    return response.data.sendLink
  },
  confirmEmail: async ({ token }: { token: string }) => {
    // confirm email with code from link
    const response = await publicGraphQLClient.mutation(authConfirmEmailMutation, { token }).toPromise()
    if (response.error) {
      // TODO: better error communication
      if (response.error.message === '[GraphQL] check token lifetime') {
        throw new ApiError('token_expired', response.error.message)
      }

      if (response.error.message === '[GraphQL] token is not valid') {
        throw new ApiError('token_invalid', response.error.message)
      }

      throw new ApiError('unknown', response.error.message)
    }

    if (response.data?.confirmEmail?.error) {
      throw new ApiError('unknown', response.data?.confirmEmail?.error)
    }

    return response.data.confirmEmail
  },

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
  getRandomTopics: async ({ amount }: { amount: number }) => {
    const response = await publicGraphQLClient.query(topicsRandomQuery, { amount }).toPromise()

    if (!response.data) {
      console.error('[api-client] getRandomTopics', response.error)
    }

    return response.data.topicsRandom
  },
  getSearchResults: async ({
    query,
    limit = FEED_SIZE,
    offset = 0
  }: {
    query: string
    limit: number
    offset?: number
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
    offset?: number
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
    limit,
    offset = 0
  }: {
    topicSlugs: string[]
    limit: number
    offset?: number
  }): Promise<Shout[]> => {
    const response = await publicGraphQLClient
      .query(articlesForTopics, {
        slugs: topicSlugs,
        limit,
        offset
      })
      .toPromise()

    if (response.error) {
      console.error('[api-client] getArticlesForTopics', response.error)
    }

    return response.data.shoutsByTopics
  },
  getArticlesForAuthors: async ({
    authorSlugs,
    limit,
    offset = 0
  }: {
    authorSlugs: string[]
    limit: number
    offset?: number
  }): Promise<Shout[]> => {
    const vars = {
      slugs: authorSlugs,
      limit,
      offset
    }
    console.debug(vars)
    const response = await publicGraphQLClient.query(articlesForAuthors, vars).toPromise()

    if (response.error) {
      console.error('[api-client] getArticlesForAuthors', response.error)
    }

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

  getSession: async (): Promise<AuthResult> => {
    if (!getToken()) {
      return null
    }

    // renew session with auth token in header (!)
    const response = await privateGraphQLClient.mutation(mySession, {}).toPromise()

    if (response.error) {
      throw new ApiError('unknown', response.error.message)
    }

    if (response.data?.refreshSession?.error) {
      throw new ApiError('unknown', response.data.refreshSession.error)
    }

    return response.data.refreshSession
  },
  getPublishedArticles: async ({ limit = FEED_SIZE, offset }: { limit?: number; offset?: number }) => {
    const response = await publicGraphQLClient.query(articlesRecentPublished, { limit, offset }).toPromise()

    if (response.error) {
      console.error('[api-client] getPublishedArticles', response.error)
    }

    return response.data.recentPublished
  },
  getAllTopics: async () => {
    const response = await publicGraphQLClient.query(topicsAll, {}).toPromise()
    if (response.error) {
      console.debug('[api-client] getAllTopics', response.error)
    }
    return response.data.topicsAll
  },
  getAllAuthors: async () => {
    const response = await publicGraphQLClient.query(authorsAll, {}).toPromise()
    if (response.error) {
      console.debug('[api-client] getAllAuthors', response.error)
    }
    return response.data.authorsAll
  },
  getAuthor: async ({ slug }: { slug: string }): Promise<Author> => {
    const response = await publicGraphQLClient.query(authorBySlug, { slug }).toPromise()
    return response.data.getAuthor
  },
  getTopic: async ({ slug }: { slug: string }): Promise<Topic> => {
    const response = await publicGraphQLClient.query(topicBySlug, { slug }).toPromise()
    return response.data.getTopic
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

    return response.data.reactionsForShouts
  },
  createArticle: async ({ article }: { article: ShoutInput }) => {
    const response = await privateGraphQLClient.mutation(createArticle, { shout: article }).toPromise()
    console.debug('createArticle response:', response)
    return response.data.createShout
  },
  createReaction: async ({ reaction }) => {
    const response = await privateGraphQLClient.mutation(reactionCreate, { reaction }).toPromise()
    console.debug('[api-client] [api] create reaction mutation called')
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
  },
  getInboxes: async (payload = {}) => {
    const resp = await privateGraphQLClient.query(myChats, payload).toPromise()
    return resp.data.myChats
  }
}

import type {
  FollowingEntity,
  AuthResult,
  ShoutInput,
  Topic,
  Author,
  LoadShoutsOptions,
  QueryLoadChatsArgs,
  QueryLoadAuthorsByArgs,
  QueryLoadMessagesByArgs,
  MutationCreateChatArgs,
  MutationCreateMessageArgs,
  QueryLoadRecipientsArgs,
  Chat
} from '../graphql/types.gen'
import { publicGraphQLClient } from '../graphql/publicGraphQLClient'
import { getToken, privateGraphQLClient } from '../graphql/privateGraphQLClient'
import topicsAll from '../graphql/query/topics-all'
import mySession from '../graphql/mutation/my-session'
import authLogoutQuery from '../graphql/mutation/auth-logout'
import authLoginQuery from '../graphql/query/auth-login'
import authRegisterMutation from '../graphql/mutation/auth-register'
import authCheckEmailQuery from '../graphql/query/auth-check-email'
import authConfirmEmailMutation from '../graphql/mutation/auth-confirm-email'
import authSendLinkMutation from '../graphql/mutation/auth-send-link'
import followMutation from '../graphql/mutation/follow'
import unfollowMutation from '../graphql/mutation/unfollow'
import topicsRandomQuery from '../graphql/query/topics-random'
import authorsAll from '../graphql/query/authors-all'
import reactionCreate from '../graphql/mutation/reaction-create'
import reactionDestroy from '../graphql/mutation/reaction-destroy'
import reactionUpdate from '../graphql/mutation/reaction-update'
import createArticle from '../graphql/mutation/article-create'
import myChats from '../graphql/query/chats-load'
import chatMessagesLoadBy from '../graphql/query/chat-messages-load-by'
import authorBySlug from '../graphql/query/author-by-slug'
import topicBySlug from '../graphql/query/topic-by-slug'
import createChat from '../graphql/mutation/create-chat'
import reactionsLoadBy from '../graphql/query/reactions-load-by'
import { REACTIONS_AMOUNT_PER_PAGE } from '../stores/zine/reactions'
import authorsLoadBy from '../graphql/query/authors-load-by'
import shoutsLoadBy from '../graphql/query/articles-load-by'
import shoutLoad from '../graphql/query/articles-load'
import loadRecipients from '../graphql/query/chat-recipients'
import createMessage from '../graphql/mutation/create-chat-message'

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

  getRandomTopics: async ({ amount }: { amount: number }) => {
    const response = await publicGraphQLClient.query(topicsRandomQuery, { amount }).toPromise()

    if (!response.data) {
      console.error('[api-client] getRandomTopics', response.error)
    }

    return response.data.topicsRandom
  },

  // subscribe

  follow: async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
    const response = await privateGraphQLClient.mutation(followMutation, { what, slug }).toPromise()
    console.debug('!!! [follow]:', response)
    return response.data.follow
  },
  unfollow: async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
    const response = await privateGraphQLClient.mutation(unfollowMutation, { what, slug }).toPromise()
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

    if (response.data?.getSession?.error) {
      throw new ApiError('unknown', response.data.getSession.error)
    }

    return response.data.getSession
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
    console.debug('getAuthor', response)
    return response.data.getAuthor
  },
  getTopic: async ({ slug }: { slug: string }): Promise<Topic> => {
    const response = await publicGraphQLClient.query(topicBySlug, { slug }).toPromise()
    return response.data.getTopic
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

  // CUDL

  updateReaction: async ({ reaction }) => {
    const response = await privateGraphQLClient.mutation(reactionUpdate, { reaction }).toPromise()

    return response.data.createReaction
  },
  destroyReaction: async ({ id }) => {
    const response = await privateGraphQLClient.mutation(reactionDestroy, { id }).toPromise()

    return response.data.deleteReaction
  },
  getAuthorsBy: async (options: QueryLoadAuthorsByArgs) => {
    const resp = await publicGraphQLClient.query(authorsLoadBy, options).toPromise()
    return resp.data.loadAuthorsBy
  },
  getShout: async (slug: string) => {
    const resp = await publicGraphQLClient
      .query(shoutLoad, {
        slug
      })
      .toPromise()
    if (resp.error) console.debug(resp)
    return resp.data.loadShout
  },
  getShouts: async (options: LoadShoutsOptions) => {
    const resp = await publicGraphQLClient
      .query(shoutsLoadBy, {
        options
      })
      .toPromise()
    if (resp.error) console.debug(resp)
    return resp.data.loadShouts
  },
  getReactionsBy: async ({ by, limit = REACTIONS_AMOUNT_PER_PAGE, offset = 0 }) => {
    const resp = await publicGraphQLClient.query(reactionsLoadBy, { by, limit, offset }).toPromise()
    if (resp.error) {
      console.error(resp.error)
      return
    }
    return resp.data.loadReactionsBy
  },

  // inbox
  getChats: async (options: QueryLoadChatsArgs): Promise<Chat[]> => {
    const resp = await privateGraphQLClient.query(myChats, options).toPromise()
    return resp.data.loadChats.chats
  },

  createChat: async (options: MutationCreateChatArgs) => {
    const resp = await privateGraphQLClient.mutation(createChat, options).toPromise()
    return resp.data.createChat
  },

  createMessage: async (options: MutationCreateMessageArgs) => {
    const resp = await privateGraphQLClient.mutation(createMessage, options).toPromise()
    return resp.data.createMessage
  },

  getChatMessages: async (options: QueryLoadMessagesByArgs) => {
    const resp = await privateGraphQLClient.query(chatMessagesLoadBy, options).toPromise()
    console.log('[getChatMessages]', resp)
    return resp.data.loadMessagesBy.messages
  },

  getRecipients: async (options: QueryLoadRecipientsArgs) => {
    const resp = await privateGraphQLClient.query(loadRecipients, options).toPromise()
    return resp.data.loadRecipients.members
  }
}

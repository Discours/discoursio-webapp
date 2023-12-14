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
  ProfileInput,
  ReactionInput,
  Chat,
  ReactionBy,
  Shout,
  NotificationsQueryParams,
  NotificationsQueryResult,
  MySubscriptionsQueryResult,
  LoadRandomTopShoutsParams,
} from '../graphql/types.gen'

import createArticle from '../graphql/mutation/article-create'
import deleteShout from '../graphql/mutation/article-delete'
import updateArticle from '../graphql/mutation/article-update'
import authConfirmEmailMutation from '../graphql/mutation/auth-confirm-email'
import authLogoutQuery from '../graphql/mutation/auth-logout'
import authRegisterMutation from '../graphql/mutation/auth-register'
import authSendLinkMutation from '../graphql/mutation/auth-send-link'
import createChat from '../graphql/mutation/create-chat'
import createMessage from '../graphql/mutation/create-chat-message'
import followMutation from '../graphql/mutation/follow'
import markAllNotificationsAsRead from '../graphql/mutation/mark-all-notifications-as-read'
import markNotificationAsRead from '../graphql/mutation/mark-notification-as-read'
import mySession from '../graphql/mutation/my-session'
import reactionCreate from '../graphql/mutation/reaction-create'
import reactionDestroy from '../graphql/mutation/reaction-destroy'
import reactionUpdate from '../graphql/mutation/reaction-update'
import unfollowMutation from '../graphql/mutation/unfollow'
import updateProfile from '../graphql/mutation/update-profile'
import { getToken, privateGraphQLClient } from '../graphql/privateGraphQLClient'
import { publicGraphQLClient } from '../graphql/publicGraphQLClient'
import shoutLoad from '../graphql/query/article-load'
import shoutsLoadBy from '../graphql/query/articles-load-by'
import shoutsLoadRandomTop from '../graphql/query/articles-load-random-top'
import articlesLoadRandomTop from '../graphql/query/articles-load-random-top'
import authCheckEmailQuery from '../graphql/query/auth-check-email'
import authLoginQuery from '../graphql/query/auth-login'
import authorBySlug from '../graphql/query/author-by-slug'
import userSubscribers from '../graphql/query/author-followers'
import userFollowedTopics from '../graphql/query/author-following-topics'
import userFollowedAuthors from '../graphql/query/author-following-users'
import authorsAll from '../graphql/query/authors-all'
import authorsLoadBy from '../graphql/query/authors-load-by'
import chatMessagesLoadBy from '../graphql/query/chat-messages-load-by'
import loadRecipients from '../graphql/query/chat-recipients'
import myChats from '../graphql/query/chats-load'
import draftsLoad from '../graphql/query/drafts-load'
import myFeed from '../graphql/query/my-feed'
import mySubscriptions from '../graphql/query/my-subscriptions'
import notifications from '../graphql/query/notifications'
import reactionsLoadBy from '../graphql/query/reactions-load-by'
import topicBySlug from '../graphql/query/topic-by-slug'
import topicsAll from '../graphql/query/topics-all'
import topicsRandomQuery from '../graphql/query/topics-random'

type ApiErrorCode =
  | 'unknown'
  | 'email_not_confirmed'
  | 'user_not_found'
  | 'user_already_exists'
  | 'token_expired'
  | 'token_invalid'
  | 'duplicate_slug'

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
      if (
        response.error.message === '[GraphQL] User not found' ||
        response.error.message === "[GraphQL] 'dict' object has no attribute 'id'"
      ) {
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
    name,
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
  authSendLink: async ({ email, lang, template }) => {
    // send link with code on email
    const response = await publicGraphQLClient
      .mutation(authSendLinkMutation, { email, lang, template })
      .toPromise()

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
    return response.data.getAuthor
  },
  getAuthorFollowers: async ({ slug }: { slug: string }): Promise<Author[]> => {
    const response = await publicGraphQLClient.query(userSubscribers, { slug }).toPromise()
    return response.data.userFollowers
  },
  getAuthorFollowingUsers: async ({ slug }: { slug: string }): Promise<Author[]> => {
    const response = await publicGraphQLClient.query(userFollowedAuthors, { slug }).toPromise()
    return response.data.userFollowedAuthors
  },
  getAuthorFollowingTopics: async ({ slug }: { slug: string }): Promise<Topic[]> => {
    const response = await publicGraphQLClient.query(userFollowedTopics, { slug }).toPromise()
    return response.data.userFollowedTopics
  },
  updateProfile: async (input: ProfileInput) => {
    const response = await privateGraphQLClient.mutation(updateProfile, { profile: input }).toPromise()
    if (response.error) {
      if (
        response.error.message.includes('duplicate key value violates unique constraint "user_slug_key"')
      ) {
        throw new ApiError('duplicate_slug', response.error.message)
      }
      throw new ApiError('unknown', response.error.message)
    }

    return response.data.updateProfile
  },
  getTopic: async ({ slug }: { slug: string }): Promise<Topic> => {
    const response = await publicGraphQLClient.query(topicBySlug, { slug }).toPromise()
    return response.data.getTopic
  },
  createArticle: async ({ article }: { article: ShoutInput }): Promise<Shout> => {
    const response = await privateGraphQLClient.mutation(createArticle, { shout: article }).toPromise()
    return response.data.createShout.shout
  },
  updateArticle: async ({
    shoutId,
    shoutInput,
    publish,
  }: {
    shoutId: number
    shoutInput?: ShoutInput
    publish: boolean
  }): Promise<Shout> => {
    const response = await privateGraphQLClient
      .mutation(updateArticle, { shoutId, shoutInput, publish })
      .toPromise()
    console.debug('[updateArticle]:', response.data)
    return response.data.updateShout.shout
  },
  deleteShout: async ({ shoutId }: { shoutId: number }): Promise<void> => {
    const response = await privateGraphQLClient.mutation(deleteShout, { shoutId }).toPromise()
    console.debug('[deleteShout]:', response)
  },
  getDrafts: async (): Promise<Shout[]> => {
    const response = await privateGraphQLClient.query(draftsLoad, {}).toPromise()
    console.debug('[getDrafts]:', response)
    return response.data.loadDrafts
  },
  createReaction: async (input: ReactionInput) => {
    const response = await privateGraphQLClient.mutation(reactionCreate, { reaction: input }).toPromise()
    console.debug('[createReaction]:', response)
    return response.data.createReaction.reaction
  },
  destroyReaction: async (id: number) => {
    const response = await privateGraphQLClient.mutation(reactionDestroy, { id: id }).toPromise()
    console.debug('[destroyReaction]:', response)
    return response.data.deleteReaction.reaction
  },
  updateReaction: async (id: number, input: ReactionInput) => {
    const response = await privateGraphQLClient
      .mutation(reactionUpdate, { id: id, reaction: input })
      .toPromise()
    console.debug('[updateReaction]:', response)
    return response.data.updateReaction.reaction
  },
  getAuthorsBy: async (options: QueryLoadAuthorsByArgs) => {
    const resp = await publicGraphQLClient.query(authorsLoadBy, options).toPromise()
    return resp.data.loadAuthorsBy
  },
  getShoutBySlug: async (slug: string) => {
    const resp = await publicGraphQLClient
      .query(shoutLoad, {
        slug,
      })
      .toPromise()

    // if (resp.error) {
    //   console.error(resp)
    // }

    return resp.data.loadShout
  },
  getShoutById: async (shoutId: number) => {
    const resp = await publicGraphQLClient
      .query(shoutLoad, {
        shoutId,
      })
      .toPromise()

    if (resp.error) {
      console.error(resp)
    }

    return resp.data.loadShout
  },

  getShouts: async (options: LoadShoutsOptions) => {
    const resp = await publicGraphQLClient.query(shoutsLoadBy, { options }).toPromise()
    if (resp.error) {
      console.error(resp)
    }

    return resp.data.loadShouts
  },

  getRandomTopShouts: async (params: LoadRandomTopShoutsParams): Promise<Shout[]> => {
    const resp = await publicGraphQLClient.query(articlesLoadRandomTop, { params }).toPromise()
    if (resp.error) {
      console.error(resp)
    }

    return resp.data.loadRandomTopShouts
  },

  getMyFeed: async (options: LoadShoutsOptions) => {
    const resp = await privateGraphQLClient.query(myFeed, { options }).toPromise()

    if (resp.error) {
      console.error(resp)
    }

    return resp.data.myFeed
  },

  getReactionsBy: async ({ by, limit }: { by: ReactionBy; limit?: number }) => {
    const resp = await publicGraphQLClient
      .query(reactionsLoadBy, { by, limit: limit ?? 1000, offset: 0 })
      .toPromise()
    return resp.data.loadReactionsBy
  },
  getNotifications: async (params: NotificationsQueryParams): Promise<NotificationsQueryResult> => {
    const resp = await privateGraphQLClient.query(notifications, { params }).toPromise()
    return resp.data.loadNotifications
  },
  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    await privateGraphQLClient
      .mutation(markNotificationAsRead, {
        notificationId,
      })
      .toPromise()
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await privateGraphQLClient.mutation(markAllNotificationsAsRead, {}).toPromise()
  },

  getMySubscriptions: async (): Promise<MySubscriptionsQueryResult> => {
    const resp = await privateGraphQLClient.query(mySubscriptions, {}).toPromise()
    // console.debug(resp.data)
    return resp.data.loadMySubscriptions
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
    return resp.data.createMessage.message
  },

  getChatMessages: async (options: QueryLoadMessagesByArgs) => {
    const resp = await privateGraphQLClient.query(chatMessagesLoadBy, options).toPromise()
    return resp.data.loadMessagesBy.messages
  },
  getRecipients: async (options: QueryLoadRecipientsArgs) => {
    const resp = await privateGraphQLClient.query(loadRecipients, options).toPromise()
    return resp.data.loadRecipients.members
  },
}

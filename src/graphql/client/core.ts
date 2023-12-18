import type {
  FollowingEntity,
  ShoutInput,
  Topic,
  Author,
  LoadShoutsOptions,
  ProfileInput,
  ReactionInput,
  ReactionBy,
  Shout,
  Result,
  QueryLoad_Authors_ByArgs,
  QueryLoad_Shouts_SearchArgs,
  QueryLoad_Shouts_Random_TopArgs,
} from '../schema/core.gen'

import { createGraphQLClient } from '../createGraphQLClient'
import createArticle from '../mutation/core/article-create'
import deleteShout from '../mutation/core/article-delete'
import updateArticle from '../mutation/core/article-update'
import followMutation from '../mutation/core/follow'
import reactionCreate from '../mutation/core/reaction-create'
import reactionDestroy from '../mutation/core/reaction-destroy'
import reactionUpdate from '../mutation/core/reaction-update'
import unfollowMutation from '../mutation/core/unfollow'
import updateProfile from '../mutation/core/update-profile'
import shoutLoad from '../query/core/article-load'
import shoutsLoadBy from '../query/core/articles-load-by'
import draftsLoad from '../query/core/articles-load-drafts'
import myFeed from '../query/core/articles-load-feed'
import loadShoutsTopRandom from '../query/core/articles-load-random-top'
import shoutsLoadSearch from '../query/core/articles-load-search'
import loadShoutsUnrated from '../query/core/articles-load-unrated'
import authorBy from '../query/core/author-by'
import authorFollowers from '../query/core/author-followers'
import authorId from '../query/core/author-id'
import authorsAll from '../query/core/authors-all'
import authorFollowed from '../query/core/authors-followed-by'
import authorsLoadBy from '../query/core/authors-load-by'
import mySubscriptions from '../query/core/my-followed'
import reactionsLoadBy from '../query/core/reactions-load-by'
import topicBySlug from '../query/core/topic-by-slug'
import topicsAll from '../query/core/topics-all'
import userFollowedTopics from '../query/core/topics-by-author'
import topicsRandomQuery from '../query/core/topics-random'

const publicGraphQLClient = createGraphQLClient('core')

export const apiClient = {
  private: null,
  connect: (token: string) => (apiClient.private = createGraphQLClient('core', token)), // NOTE: use it after token appears

  getRandomTopShouts: async (params: QueryLoad_Shouts_Random_TopArgs) => {
    const response = await publicGraphQLClient.query(loadShoutsTopRandom, params).toPromise()
    if (!response.data) {
      console.error('[graphql.core] getRandomTopShouts error', response.error)
    }
    return response.data.load_shouts_top_random
  },

  getUnratedShouts: async (limit = 50, offset = 0) => {
    const response = await apiClient.private.query(loadShoutsUnrated, { limit, offset }).toPromise()

    if (!response.data) {
      console.error('[graphql.core] getUnratedShouts error', response.error)
    }

    return response.data.load_shouts_unrated
  },

  getRandomTopics: async ({ amount }: { amount: number }) => {
    const response = await publicGraphQLClient.query(topicsRandomQuery, { amount }).toPromise()

    if (!response.data) {
      console.error('[graphql.client.core] getRandomTopics', response.error)
    }

    return response.data.get_topics_random
  },

  follow: async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
    const response = await apiClient.private.mutation(followMutation, { what, slug }).toPromise()
    return response.data.follow
  },
  unfollow: async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
    const response = await apiClient.private.mutation(unfollowMutation, { what, slug }).toPromise()
    return response.data.unfollow
  },

  getAllTopics: async () => {
    const response = await publicGraphQLClient.query(topicsAll, {}).toPromise()
    if (response.error) {
      console.debug('[graphql.client.core] get_topicss_all', response.error)
    }
    return response.data.get_topics_all
  },
  getAllAuthors: async (limit: number = 50, offset: number = 0) => {
    const response = await publicGraphQLClient.query(authorsAll, { limit, offset }).toPromise()
    if (response.error) {
      console.debug('[graphql.client.core] load_authors_all', response.error)
    }
    return response.data.load_authors_all
  },
  getAuthor: async (params: { slug?: string; author_id?: number }): Promise<Author> => {
    const response = await publicGraphQLClient.query(authorBy, params).toPromise()
    return response.data.get_author
  },
  getAuthorId: async (params: { user: string }): Promise<Author> => {
    const response = await publicGraphQLClient.query(authorId, params).toPromise()
    return response.data.get_author_id
  },
  getAuthorFollowers: async ({ slug }: { slug: string }): Promise<Author[]> => {
    const response = await publicGraphQLClient.query(authorFollowers, { slug }).toPromise()
    return response.data.get_author_followers
  },
  getAuthorFollowingUsers: async ({ slug }: { slug: string }): Promise<Author[]> => {
    const response = await publicGraphQLClient.query(authorFollowed, { slug }).toPromise()
    return response.data.get_author_followed
  },
  getAuthorFollowingTopics: async ({ slug }: { slug: string }): Promise<Topic[]> => {
    const response = await publicGraphQLClient.query(userFollowedTopics, { slug }).toPromise()
    return response.data.userFollowedTopics
  },
  updateProfile: async (input: ProfileInput) => {
    const response = await apiClient.private.mutation(updateProfile, { profile: input }).toPromise()
    return response.data.update_profile
  },
  getTopic: async ({ slug }: { slug: string }): Promise<Topic> => {
    const response = await publicGraphQLClient.query(topicBySlug, { slug }).toPromise()
    return response.data.get_topic
  },
  createArticle: async ({ article }: { article: ShoutInput }): Promise<Shout> => {
    const response = await apiClient.private.mutation(createArticle, { shout: article }).toPromise()
    return response.data.create_shout.shout
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
    const response = await apiClient.private
      .mutation(updateArticle, { shoutId, shoutInput, publish })
      .toPromise()
    console.debug('[graphql.client.core] updateArticle:', response.data)
    return response.data.update_shout.shout
  },
  deleteShout: async ({ shoutId }: { shoutId: number }): Promise<void> => {
    const response = await apiClient.private.mutation(deleteShout, { shout_id: shoutId }).toPromise()
    console.debug('[graphql.client.core] deleteShout:', response)
  },
  getDrafts: async (): Promise<Shout[]> => {
    const response = await apiClient.private.query(draftsLoad, {}).toPromise()
    console.debug('[graphql.client.core] getDrafts:', response)
    return response.data.load_shouts_drafts
  },
  createReaction: async (input: ReactionInput) => {
    const response = await apiClient.private.mutation(reactionCreate, { reaction: input }).toPromise()
    console.debug('[graphql.client.core] createReaction:', response)
    return response.data.create_reaction.reaction
  },
  destroyReaction: async (id: number) => {
    const response = await apiClient.private.mutation(reactionDestroy, { id: id }).toPromise()
    console.debug('[graphql.client.core] destroyReaction:', response)
    return response.data.delete_reaction.reaction
  },
  updateReaction: async (id: number, input: ReactionInput) => {
    const response = await apiClient.private
      .mutation(reactionUpdate, { id: id, reaction: input })
      .toPromise()
    console.debug('[graphql.client.core] updateReaction:', response)
    return response.data.update_reaction.reaction
  },
  getAuthorsBy: async (args: QueryLoad_Authors_ByArgs) => {
    const resp = await publicGraphQLClient.query(authorsLoadBy, args).toPromise()
    return resp.data.load_authors_by
  },
  getShoutBySlug: async (slug: string) => {
    const resp = await publicGraphQLClient.query(shoutLoad, { slug }).toPromise()
    return resp.data.get_shout
  },
  getShoutById: async (shout_id: number) => {
    const resp = await publicGraphQLClient.query(shoutLoad, { shout_id }).toPromise()
    if (resp.error) console.error(resp)

    return resp.data.get_shout
  },

  getShouts: async (options: LoadShoutsOptions) => {
    const resp = await publicGraphQLClient.query(shoutsLoadBy, { options }).toPromise()
    if (resp.error) console.error(resp)

    return resp.data.load_shouts_by
  },

  getShoutsSearch: async (args: QueryLoad_Shouts_SearchArgs) => {
    const resp = await publicGraphQLClient.query(shoutsLoadSearch, args).toPromise()
    if (resp.error) console.error(resp)

    return resp.data.load_shouts_search
  },

  getMyFeed: async (options: LoadShoutsOptions) => {
    const resp = await apiClient.private.query(myFeed, { options }).toPromise()
    if (resp.error) console.error(resp)

    return resp.data.load_shouts_feed
  },

  getReactionsBy: async ({ by, limit, offset }: { by: ReactionBy; limit?: number; offset?: number }) => {
    const resp = await publicGraphQLClient
      .query(reactionsLoadBy, { by, limit: limit ?? 1000, offset: offset ?? 0 })
      .toPromise()
    return resp.data.load_reactions_by
  },
  getMySubscriptions: async (): Promise<Result> => {
    const resp = await apiClient.private.query(mySubscriptions, {}).toPromise()

    return resp.data.get_my_followed
  },
}

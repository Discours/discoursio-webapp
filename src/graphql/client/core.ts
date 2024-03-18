import type {
  Author,
  AuthorFollows,
  CommonResult,
  FollowingEntity,
  LoadShoutsOptions,
  MutationDelete_ShoutArgs,
  ProfileInput,
  QueryLoad_Authors_ByArgs,
  QueryLoad_Shouts_Random_TopArgs,
  QueryLoad_Shouts_SearchArgs,
  ReactionBy,
  ReactionInput,
  Shout,
  ShoutInput,
  Topic,
} from '../schema/core.gen'

import { createGraphQLClient } from '../createGraphQLClient'
import createArticle from '../mutation/core/article-create'
import deleteShout from '../mutation/core/article-delete'
import updateArticle from '../mutation/core/article-update'
import rateAuthor from '../mutation/core/author-rate'
import updateAuthor from '../mutation/core/author-update'
import followMutation from '../mutation/core/follow'
import reactionCreate from '../mutation/core/reaction-create'
import reactionDestroy from '../mutation/core/reaction-destroy'
import reactionUpdate from '../mutation/core/reaction-update'
import unfollowMutation from '../mutation/core/unfollow'
import shoutLoad from '../query/core/article-load'
import getMyShout from '../query/core/article-my'
import shoutsLoadBy from '../query/core/articles-load-by'
import draftsLoad from '../query/core/articles-load-drafts'
import myFeed from '../query/core/articles-load-feed'
import loadShoutsTopRandom from '../query/core/articles-load-random-top'
import articlesLoadRandomTopic from '../query/core/articles-load-random-topic'
import shoutsLoadSearch from '../query/core/articles-load-search'
import loadShoutsUnrated from '../query/core/articles-load-unrated'
import authorBy from '../query/core/author-by'
import authorFollowers from '../query/core/author-followers'
import authorFollows from '../query/core/author-follows'
import authorId from '../query/core/author-id'
import authorsAll from '../query/core/authors-all'
import authorsLoadBy from '../query/core/authors-load-by'
import reactionsLoadBy from '../query/core/reactions-load-by'
import topicBySlug from '../query/core/topic-by-slug'
import topicsAll from '../query/core/topics-all'
import topicsRandomQuery from '../query/core/topics-random'

const publicGraphQLClient = createGraphQLClient('core')

export const apiClient = {
  private: null,
  connect: (token: string) => {
    // NOTE: use it after token appears
    apiClient.private = createGraphQLClient('core', token)
  },

  getRandomTopShouts: async (params: QueryLoad_Shouts_Random_TopArgs) => {
    const response = await publicGraphQLClient.query(loadShoutsTopRandom, params).toPromise()
    if (!response.data) console.error('[graphql.core] load_shouts_random_top failed', response)

    return response.data.load_shouts_random_top
  },

  getUnratedShouts: async (limit = 50, offset = 0) => {
    const response = await apiClient.private.query(loadShoutsUnrated, { limit, offset }).toPromise()
    if (!response.data) console.error('[graphql.core] load_shouts_unrated', response)

    return response.data.load_shouts_unrated
  },

  rateAuthor: async ({ rated_slug, value }: { rated_slug: string; value: number }) => {
    const response = await apiClient.private.mutation(rateAuthor, { rated_slug, value }).toPromise()
    if (!response.data) console.error('[graphql.client.core] get_topics_random failed', response)

    return response.data.rate_author
  },

  getRandomTopics: async ({ amount }: { amount: number }) => {
    const response = await publicGraphQLClient.query(topicsRandomQuery, { amount }).toPromise()
    if (!response.data) console.error('[graphql.client.core] get_topics_random failed', response)

    return response.data.get_topics_random
  },

  getRandomTopicShouts: async (limit: number): Promise<CommonResult> => {
    const resp = await publicGraphQLClient.query(articlesLoadRandomTopic, { limit }).toPromise()
    if (!resp.data) console.error('[graphql.client.core] load_shouts_random_topic', resp)
    return resp.data.load_shouts_random_topic
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
    if (!response.data) console.error('[graphql.client.core] get_topics_all', response)

    return response.data.get_topics_all
  },

  getAllAuthors: async () => {
    const response = await publicGraphQLClient.query(authorsAll, {}).toPromise()
    if (!response.data) console.error('[graphql.client.core] getAllAuthors', response)

    return response.data.get_authors_all
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

  getAuthorFollows: async (params: {
    slug?: string
    author_id?: number
    user?: string
  }): Promise<AuthorFollows> => {
    const response = await publicGraphQLClient.query(authorFollows, params).toPromise()
    return response.data.get_author_follows
  },

  updateAuthor: async (input: ProfileInput) => {
    const response = await apiClient.private.mutation(updateAuthor, { profile: input }).toPromise()
    return response.data.update_author
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
    shout_id,
    shout_input,
    publish,
  }: {
    shout_id: number
    shout_input?: ShoutInput
    publish: boolean
  }): Promise<CommonResult> => {
    const response = await apiClient.private
      .mutation(updateArticle, { shout_id, shout_input, publish })
      .toPromise()
    console.debug('[graphql.client.core] updateArticle:', response.data)
    return response.data.update_shout
  },

  deleteShout: async (params: MutationDelete_ShoutArgs): Promise<void> => {
    const response = await apiClient.private.mutation(deleteShout, params).toPromise()
    console.debug('[graphql.client.core] deleteShout:', response)
  },

  getDrafts: async (): Promise<Shout[]> => {
    const response = await apiClient.private.query(draftsLoad, {}).toPromise()
    console.debug('[graphql.client.core] getDrafts:', response)
    return response.data.get_shouts_drafts
  },
  createReaction: async (input: ReactionInput) => {
    const response = await apiClient.private.mutation(reactionCreate, { reaction: input }).toPromise()
    console.debug('[graphql.client.core] createReaction:', response)
    return response.data.create_reaction
  },
  destroyReaction: async (reaction_id: number) => {
    const response = await apiClient.private.mutation(reactionDestroy, { reaction_id }).toPromise()
    console.debug('[graphql.client.core] destroyReaction:', response)
    return response.data.delete_reaction
  },
  updateReaction: async (reaction: ReactionInput) => {
    const response = await apiClient.private.mutation(reactionUpdate, { reaction }).toPromise()
    console.debug('[graphql.client.core] updateReaction:', response)
    return response.data.update_reaction.reaction
  },
  loadAuthorsBy: async (args: QueryLoad_Authors_ByArgs) => {
    const resp = await publicGraphQLClient.query(authorsLoadBy, args).toPromise()
    console.debug('[graphql.client.core] authorsLoadBy:', resp)
    return resp.data.load_authors_by
  },

  getShoutBySlug: async (slug: string) => {
    const resp = await publicGraphQLClient.query(shoutLoad, { slug }).toPromise()
    return resp.data.get_shout
  },

  getMyShout: async (shout_id: number) => {
    await apiClient.private
    const resp = await apiClient.private.query(getMyShout, { shout_id }).toPromise()
    if (resp.error) console.error(resp)

    return resp.data.get_my_shout
  },

  getShouts: async (options: LoadShoutsOptions) => {
    const resp = await publicGraphQLClient.query(shoutsLoadBy, { options }).toPromise()
    if (resp.error) console.error(resp)

    return resp.data?.load_shouts_by
  },

  getShoutsSearch: async ({ text, limit, offset }: QueryLoad_Shouts_SearchArgs) => {
    const resp = await publicGraphQLClient.query(shoutsLoadSearch, { text, limit, offset }).toPromise()
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
}

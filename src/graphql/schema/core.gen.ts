import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
}

export type Author = {
  about?: Maybe<Scalars['String']['output']>
  bio?: Maybe<Scalars['String']['output']>
  communities?: Maybe<Array<Maybe<Community>>>
  created_at?: Maybe<Scalars['Int']['output']>
  deleted_at?: Maybe<Scalars['Int']['output']>
  id: Scalars['Int']['output']
  last_seen?: Maybe<Scalars['Int']['output']>
  links?: Maybe<Array<Maybe<Scalars['String']['output']>>>
  name?: Maybe<Scalars['String']['output']>
  pic?: Maybe<Scalars['String']['output']>
  seo?: Maybe<Scalars['String']['output']>
  slug: Scalars['String']['output']
  stat?: Maybe<AuthorStat>
  updated_at?: Maybe<Scalars['Int']['output']>
  user: Scalars['String']['output']
}

export type AuthorFollowsResult = {
  authors?: Maybe<Array<Maybe<Author>>>
  communities?: Maybe<Array<Maybe<Community>>>
  error?: Maybe<Scalars['String']['output']>
  topics?: Maybe<Array<Maybe<Topic>>>
}

export type AuthorStat = {
  authors?: Maybe<Scalars['Int']['output']>
  comments?: Maybe<Scalars['Int']['output']>
  followers?: Maybe<Scalars['Int']['output']>
  rating?: Maybe<Scalars['Int']['output']>
  rating_comments?: Maybe<Scalars['Int']['output']>
  rating_shouts?: Maybe<Scalars['Int']['output']>
  shouts?: Maybe<Scalars['Int']['output']>
  viewed?: Maybe<Scalars['Int']['output']>
}

export type AuthorsBy = {
  after?: InputMaybe<Scalars['Int']['input']>
  created_at?: InputMaybe<Scalars['Int']['input']>
  last_seen?: InputMaybe<Scalars['Int']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  order?: InputMaybe<Scalars['String']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  stat?: InputMaybe<Scalars['String']['input']>
  topic?: InputMaybe<Scalars['String']['input']>
}

export type Collection = {
  amount?: Maybe<Scalars['Int']['output']>
  created_at: Scalars['Int']['output']
  created_by: Author
  desc?: Maybe<Scalars['String']['output']>
  id: Scalars['Int']['output']
  published_at?: Maybe<Scalars['Int']['output']>
  slug: Scalars['String']['output']
  title: Scalars['String']['output']
}

export type CommonResult = {
  author?: Maybe<Author>
  authors?: Maybe<Array<Maybe<Author>>>
  communities?: Maybe<Array<Maybe<Community>>>
  community?: Maybe<Community>
  error?: Maybe<Scalars['String']['output']>
  reaction?: Maybe<Reaction>
  reactions?: Maybe<Array<Maybe<Reaction>>>
  shout?: Maybe<Shout>
  shouts?: Maybe<Array<Maybe<Shout>>>
  slugs?: Maybe<Array<Maybe<Scalars['String']['output']>>>
  topic?: Maybe<Topic>
  topics?: Maybe<Array<Maybe<Topic>>>
}

export type Community = {
  created_at: Scalars['Int']['output']
  created_by: Author
  desc?: Maybe<Scalars['String']['output']>
  id: Scalars['Int']['output']
  name: Scalars['String']['output']
  pic: Scalars['String']['output']
  slug: Scalars['String']['output']
}

export enum FollowingEntity {
  Author = 'AUTHOR',
  Community = 'COMMUNITY',
  Shout = 'SHOUT',
  Topic = 'TOPIC',
}

export type Invite = {
  author_id: Scalars['Int']['output']
  id: Scalars['Int']['output']
  inviter_id: Scalars['Int']['output']
  shout_id: Scalars['Int']['output']
  status?: Maybe<InviteStatus>
}

export enum InviteStatus {
  Accepted = 'ACCEPTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
}

export type LoadShoutsFilters = {
  after?: InputMaybe<Scalars['Int']['input']>
  author?: InputMaybe<Scalars['String']['input']>
  featured?: InputMaybe<Scalars['Boolean']['input']>
  layouts?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  reacted?: InputMaybe<Scalars['Boolean']['input']>
  topic?: InputMaybe<Scalars['String']['input']>
}

export type LoadShoutsOptions = {
  filters?: InputMaybe<LoadShoutsFilters>
  limit: Scalars['Int']['input']
  offset?: InputMaybe<Scalars['Int']['input']>
  order_by?: InputMaybe<Scalars['String']['input']>
  order_by_desc?: InputMaybe<Scalars['Boolean']['input']>
  random_limit?: InputMaybe<Scalars['Int']['input']>
  with_author_captions?: InputMaybe<Scalars['Boolean']['input']>
}

export type Mutation = {
  accept_invite: CommonResult
  create_invite: CommonResult
  create_reaction: CommonResult
  create_shout: CommonResult
  create_topic: CommonResult
  delete_reaction: CommonResult
  delete_shout: CommonResult
  delete_topic: CommonResult
  follow: CommonResult
  notification_mark_seen: CommonResult
  notifications_seen_after: CommonResult
  notifications_seen_thread: CommonResult
  rate_author: CommonResult
  reject_invite: CommonResult
  remove_author: CommonResult
  remove_invite: CommonResult
  unfollow: CommonResult
  update_author: CommonResult
  update_reaction: CommonResult
  update_shout: CommonResult
  update_topic: CommonResult
}

export type MutationAccept_InviteArgs = {
  invite_id: Scalars['Int']['input']
}

export type MutationCreate_InviteArgs = {
  author_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type MutationCreate_ReactionArgs = {
  reaction: ReactionInput
}

export type MutationCreate_ShoutArgs = {
  inp: ShoutInput
}

export type MutationCreate_TopicArgs = {
  input: TopicInput
}

export type MutationDelete_ReactionArgs = {
  reaction_id: Scalars['Int']['input']
}

export type MutationDelete_ShoutArgs = {
  shout_id: Scalars['Int']['input']
}

export type MutationDelete_TopicArgs = {
  slug: Scalars['String']['input']
}

export type MutationFollowArgs = {
  slug: Scalars['String']['input']
  what: FollowingEntity
}

export type MutationNotification_Mark_SeenArgs = {
  notification_id: Scalars['Int']['input']
  seen?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationNotifications_Seen_AfterArgs = {
  after: Scalars['Int']['input']
  seen?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationNotifications_Seen_ThreadArgs = {
  seen?: InputMaybe<Scalars['Boolean']['input']>
  thread_id: Scalars['String']['input']
}

export type MutationRate_AuthorArgs = {
  rated_slug: Scalars['String']['input']
  value: Scalars['Int']['input']
}

export type MutationReject_InviteArgs = {
  invite_id: Scalars['Int']['input']
}

export type MutationRemove_AuthorArgs = {
  author_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type MutationRemove_InviteArgs = {
  invite_id: Scalars['Int']['input']
}

export type MutationUnfollowArgs = {
  slug: Scalars['String']['input']
  what: FollowingEntity
}

export type MutationUpdate_AuthorArgs = {
  profile: ProfileInput
}

export type MutationUpdate_ReactionArgs = {
  reaction: ReactionInput
}

export type MutationUpdate_ShoutArgs = {
  publish?: InputMaybe<Scalars['Boolean']['input']>
  shout_id: Scalars['Int']['input']
  shout_input?: InputMaybe<ShoutInput>
}

export type MutationUpdate_TopicArgs = {
  input: TopicInput
}

export type Notification = {
  action: Scalars['String']['output']
  created_at: Scalars['Int']['output']
  entity: Scalars['String']['output']
  id: Scalars['Int']['output']
  payload: Scalars['String']['output']
  seen?: Maybe<Array<Maybe<Author>>>
}

export type NotificationGroup = {
  action: Scalars['String']['output']
  authors?: Maybe<Array<Maybe<Author>>>
  entity: Scalars['String']['output']
  reactions?: Maybe<Array<Maybe<Reaction>>>
  seen?: Maybe<Scalars['Boolean']['output']>
  shout?: Maybe<Shout>
  thread: Scalars['String']['output']
  updated_at: Scalars['Int']['output']
}

export type NotificationSeenInput = {
  notifications?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  thread?: InputMaybe<Scalars['Int']['input']>
}

export type NotificationSeenResult = {
  error?: Maybe<Scalars['String']['output']>
}

export type NotificationsResult = {
  error?: Maybe<Scalars['String']['output']>
  notifications: Array<NotificationGroup>
  total: Scalars['Int']['output']
  unread: Scalars['Int']['output']
}

export type ProfileInput = {
  about?: InputMaybe<Scalars['String']['input']>
  bio?: InputMaybe<Scalars['String']['input']>
  links?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  name?: InputMaybe<Scalars['String']['input']>
  pic?: InputMaybe<Scalars['String']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type Query = {
  get_author?: Maybe<Author>
  get_author_followers?: Maybe<Array<Maybe<Author>>>
  get_author_follows: AuthorFollowsResult
  get_author_follows_authors?: Maybe<Array<Maybe<Author>>>
  get_author_follows_topics?: Maybe<Array<Maybe<Topic>>>
  get_author_id?: Maybe<Author>
  get_authors_all?: Maybe<Array<Maybe<Author>>>
  get_communities_all?: Maybe<Array<Maybe<Community>>>
  get_community?: Maybe<Community>
  get_my_shout: CommonResult
  get_shout?: Maybe<Shout>
  get_shout_followers?: Maybe<Array<Maybe<Author>>>
  get_shouts_drafts?: Maybe<Array<Maybe<Shout>>>
  get_topic?: Maybe<Topic>
  get_topic_followers?: Maybe<Array<Maybe<Author>>>
  get_topics_all?: Maybe<Array<Maybe<Topic>>>
  get_topics_by_author?: Maybe<Array<Maybe<Topic>>>
  get_topics_by_community?: Maybe<Array<Maybe<Topic>>>
  get_topics_random?: Maybe<Array<Maybe<Topic>>>
  load_authors_by?: Maybe<Array<Maybe<Author>>>
  load_notifications: NotificationsResult
  load_reactions_by?: Maybe<Array<Maybe<Reaction>>>
  load_shouts_by?: Maybe<Array<Maybe<Shout>>>
  load_shouts_feed?: Maybe<Array<Maybe<Shout>>>
  load_shouts_followed?: Maybe<Array<Maybe<Shout>>>
  load_shouts_random_top?: Maybe<Array<Maybe<Shout>>>
  load_shouts_random_topic: CommonResult
  load_shouts_search?: Maybe<Array<Maybe<SearchResult>>>
  load_shouts_unrated?: Maybe<Array<Maybe<Shout>>>
  search_authors?: Maybe<Array<Maybe<Author>>>
}

export type QueryGet_AuthorArgs = {
  author_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type QueryGet_Author_FollowersArgs = {
  author_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  user?: InputMaybe<Scalars['String']['input']>
}

export type QueryGet_Author_FollowsArgs = {
  author_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  user?: InputMaybe<Scalars['String']['input']>
}

export type QueryGet_Author_Follows_AuthorsArgs = {
  author_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  user?: InputMaybe<Scalars['String']['input']>
}

export type QueryGet_Author_Follows_TopicsArgs = {
  author_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  user?: InputMaybe<Scalars['String']['input']>
}

export type QueryGet_Author_IdArgs = {
  user: Scalars['String']['input']
}

export type QueryGet_My_ShoutArgs = {
  shout_id: Scalars['Int']['input']
}

export type QueryGet_ShoutArgs = {
  shout_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type QueryGet_Shout_FollowersArgs = {
  shout_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type QueryGet_TopicArgs = {
  slug: Scalars['String']['input']
}

export type QueryGet_Topic_FollowersArgs = {
  slug?: InputMaybe<Scalars['String']['input']>
  topic_id?: InputMaybe<Scalars['Int']['input']>
}

export type QueryGet_Topics_By_AuthorArgs = {
  author_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  user?: InputMaybe<Scalars['String']['input']>
}

export type QueryGet_Topics_By_CommunityArgs = {
  community_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type QueryGet_Topics_RandomArgs = {
  amount?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoad_Authors_ByArgs = {
  by: AuthorsBy
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoad_NotificationsArgs = {
  after: Scalars['Int']['input']
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoad_Reactions_ByArgs = {
  by: ReactionBy
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoad_Shouts_ByArgs = {
  options?: InputMaybe<LoadShoutsOptions>
}

export type QueryLoad_Shouts_FeedArgs = {
  options?: InputMaybe<LoadShoutsOptions>
}

export type QueryLoad_Shouts_FollowedArgs = {
  follower_id: Scalars['Int']['input']
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoad_Shouts_Random_TopArgs = {
  options?: InputMaybe<LoadShoutsOptions>
}

export type QueryLoad_Shouts_Random_TopicArgs = {
  limit: Scalars['Int']['input']
}

export type QueryLoad_Shouts_SearchArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  text: Scalars['String']['input']
}

export type QueryLoad_Shouts_UnratedArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QuerySearch_AuthorsArgs = {
  what: Scalars['String']['input']
}

export type Rating = {
  rater: Scalars['String']['output']
  value: Scalars['Int']['output']
}

export type Reaction = {
  body?: Maybe<Scalars['String']['output']>
  created_at: Scalars['Int']['output']
  created_by: Author
  deleted_at?: Maybe<Scalars['Int']['output']>
  deleted_by?: Maybe<Author>
  id: Scalars['Int']['output']
  kind: ReactionKind
  oid?: Maybe<Scalars['String']['output']>
  range?: Maybe<Scalars['String']['output']>
  reply_to?: Maybe<Scalars['Int']['output']>
  shout: Shout
  stat?: Maybe<Stat>
  updated_at?: Maybe<Scalars['Int']['output']>
}

export type ReactionBy = {
  after?: InputMaybe<Scalars['Int']['input']>
  comment?: InputMaybe<Scalars['Boolean']['input']>
  created_by?: InputMaybe<Scalars['Int']['input']>
  rating?: InputMaybe<Scalars['Boolean']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  shout?: InputMaybe<Scalars['String']['input']>
  shouts?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  sort?: InputMaybe<ReactionSort>
  topic?: InputMaybe<Scalars['String']['input']>
}

export type ReactionInput = {
  body?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['Int']['input']>
  kind: ReactionKind
  quote?: InputMaybe<Scalars['String']['input']>
  reply_to?: InputMaybe<Scalars['Int']['input']>
  shout: Scalars['Int']['input']
}

export enum ReactionKind {
  Accept = 'ACCEPT',
  Agree = 'AGREE',
  Ask = 'ASK',
  Comment = 'COMMENT',
  Disagree = 'DISAGREE',
  Dislike = 'DISLIKE',
  Disproof = 'DISPROOF',
  Like = 'LIKE',
  Proof = 'PROOF',
  Propose = 'PROPOSE',
  Quote = 'QUOTE',
  Reject = 'REJECT',
}

export enum ReactionSort {
  Dislike = 'dislike',
  Like = 'like',
  Newest = 'newest',
  Oldest = 'oldest',
}

export enum ReactionStatus {
  Changed = 'CHANGED',
  Deleted = 'DELETED',
  Explained = 'EXPLAINED',
  New = 'NEW',
  Updated = 'UPDATED',
}

export type ReactionUpdating = {
  error?: Maybe<Scalars['String']['output']>
  reaction?: Maybe<Reaction>
  status?: Maybe<ReactionStatus>
}

export type SearchResult = {
  authors?: Maybe<Array<Maybe<Author>>>
  cover?: Maybe<Scalars['String']['output']>
  created_at?: Maybe<Scalars['Int']['output']>
  main_topic?: Maybe<Scalars['String']['output']>
  score: Scalars['Float']['output']
  slug: Scalars['String']['output']
  title: Scalars['String']['output']
  topics?: Maybe<Array<Maybe<Topic>>>
}

export type Shout = {
  authors?: Maybe<Array<Maybe<Author>>>
  body: Scalars['String']['output']
  communities?: Maybe<Array<Maybe<Community>>>
  community?: Maybe<Scalars['String']['output']>
  cover?: Maybe<Scalars['String']['output']>
  cover_caption?: Maybe<Scalars['String']['output']>
  created_at: Scalars['Int']['output']
  created_by: Author
  deleted_at?: Maybe<Scalars['Int']['output']>
  deleted_by?: Maybe<Author>
  description?: Maybe<Scalars['String']['output']>
  featured_at?: Maybe<Scalars['Int']['output']>
  id: Scalars['Int']['output']
  lang?: Maybe<Scalars['String']['output']>
  layout: Scalars['String']['output']
  lead?: Maybe<Scalars['String']['output']>
  main_topic?: Maybe<Scalars['String']['output']>
  media?: Maybe<Scalars['String']['output']>
  published_at?: Maybe<Scalars['Int']['output']>
  score?: Maybe<Scalars['Float']['output']>
  slug: Scalars['String']['output']
  stat?: Maybe<Stat>
  subtitle?: Maybe<Scalars['String']['output']>
  title: Scalars['String']['output']
  topics?: Maybe<Array<Maybe<Topic>>>
  updated_at?: Maybe<Scalars['Int']['output']>
  updated_by?: Maybe<Author>
  version_of?: Maybe<Shout>
}

export type ShoutInput = {
  body?: InputMaybe<Scalars['String']['input']>
  community?: InputMaybe<Scalars['Int']['input']>
  cover?: InputMaybe<Scalars['String']['input']>
  description?: InputMaybe<Scalars['String']['input']>
  layout?: InputMaybe<Scalars['String']['input']>
  lead?: InputMaybe<Scalars['String']['input']>
  media?: InputMaybe<Scalars['String']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  subtitle?: InputMaybe<Scalars['String']['input']>
  title?: InputMaybe<Scalars['String']['input']>
  topics?: InputMaybe<Array<InputMaybe<TopicInput>>>
}

export type Stat = {
  commented?: Maybe<Scalars['Int']['output']>
  last_comment?: Maybe<Scalars['Int']['output']>
  ranking?: Maybe<Scalars['Int']['output']>
  rating?: Maybe<Scalars['Int']['output']>
  reacted?: Maybe<Scalars['Int']['output']>
  viewed?: Maybe<Scalars['Int']['output']>
}

export type Topic = {
  body?: Maybe<Scalars['String']['output']>
  id: Scalars['Int']['output']
  oid?: Maybe<Scalars['String']['output']>
  pic?: Maybe<Scalars['String']['output']>
  slug: Scalars['String']['output']
  stat?: Maybe<TopicStat>
  title?: Maybe<Scalars['String']['output']>
}

export type TopicInput = {
  body?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['Int']['input']>
  pic?: InputMaybe<Scalars['String']['input']>
  slug: Scalars['String']['input']
  title?: InputMaybe<Scalars['String']['input']>
}

export type TopicStat = {
  authors: Scalars['Int']['output']
  comments?: Maybe<Scalars['Int']['output']>
  followers: Scalars['Int']['output']
  shouts: Scalars['Int']['output']
}

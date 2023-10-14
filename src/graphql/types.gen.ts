import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  DateTime: any
}

export type AuthResult = {
  error?: Maybe<Scalars['String']>
  news?: Maybe<UserFollowings>
  token?: Maybe<Scalars['String']>
  user?: Maybe<User>
}

export type Author = {
  about?: Maybe<Scalars['String']>
  bio?: Maybe<Scalars['String']>
  caption?: Maybe<Scalars['String']>
  createdAt?: Maybe<Scalars['DateTime']>
  id: Scalars['Int']
  lastSeen?: Maybe<Scalars['DateTime']>
  links?: Maybe<Array<Maybe<Scalars['String']>>>
  name: Scalars['String']
  roles?: Maybe<Array<Maybe<Role>>>
  slug: Scalars['String']
  stat?: Maybe<AuthorStat>
  userpic?: Maybe<Scalars['String']>
}

export type AuthorStat = {
  commented?: Maybe<Scalars['Int']>
  followers?: Maybe<Scalars['Int']>
  followings?: Maybe<Scalars['Int']>
  rating?: Maybe<Scalars['Int']>
  shouts?: Maybe<Scalars['Int']>
}

export type AuthorsBy = {
  createdAt?: InputMaybe<Scalars['DateTime']>
  days?: InputMaybe<Scalars['Int']>
  lastSeen?: InputMaybe<Scalars['DateTime']>
  name?: InputMaybe<Scalars['String']>
  order?: InputMaybe<Scalars['String']>
  slug?: InputMaybe<Scalars['String']>
  stat?: InputMaybe<Scalars['String']>
  topic?: InputMaybe<Scalars['String']>
}

export type Chat = {
  admins?: Maybe<Array<Maybe<Scalars['Int']>>>
  createdAt: Scalars['Int']
  createdBy: Scalars['Int']
  description?: Maybe<Scalars['String']>
  id: Scalars['String']
  members?: Maybe<Array<Maybe<ChatMember>>>
  messages?: Maybe<Array<Maybe<Message>>>
  private?: Maybe<Scalars['Boolean']>
  title?: Maybe<Scalars['String']>
  unread?: Maybe<Scalars['Int']>
  updatedAt: Scalars['Int']
}

export type ChatInput = {
  description?: InputMaybe<Scalars['String']>
  id: Scalars['String']
  title?: InputMaybe<Scalars['String']>
}

export type ChatMember = {
  id: Scalars['Int']
  lastSeen: Maybe<Scalars['Int']>
  name: Scalars['String']
  online?: Maybe<Scalars['Boolean']>
  slug: Scalars['String']
  userpic?: Maybe<Scalars['String']>
}

export type Collection = {
  amount?: Maybe<Scalars['Int']>
  createdAt: Scalars['DateTime']
  createdBy: User
  desc?: Maybe<Scalars['String']>
  id: Scalars['Int']
  publishedAt?: Maybe<Scalars['DateTime']>
  slug: Scalars['String']
  title: Scalars['String']
}

export type Community = {
  createdAt: Scalars['DateTime']
  createdBy: User
  desc?: Maybe<Scalars['String']>
  id: Scalars['Int']
  name: Scalars['String']
  pic: Scalars['String']
  slug: Scalars['String']
}

export enum FollowingEntity {
  Author = 'AUTHOR',
  Community = 'COMMUNITY',
  Reactions = 'REACTIONS',
  Topic = 'TOPIC'
}

export type LoadShoutsFilters = {
  author?: InputMaybe<Scalars['String']>
  body?: InputMaybe<Scalars['String']>
  days?: InputMaybe<Scalars['Int']>
  excludeLayout?: InputMaybe<Scalars['String']>
  layout?: InputMaybe<Scalars['String']>
  reacted?: InputMaybe<Scalars['Boolean']>
  title?: InputMaybe<Scalars['String']>
  topic?: InputMaybe<Scalars['String']>
  visibility?: InputMaybe<Scalars['String']>
}

export type LoadShoutsOptions = {
  filters?: InputMaybe<LoadShoutsFilters>
  limit: Scalars['Int']
  offset?: InputMaybe<Scalars['Int']>
  order_by?: InputMaybe<Scalars['String']>
  order_by_desc?: InputMaybe<Scalars['Boolean']>
  with_author_captions?: InputMaybe<Scalars['Boolean']>
}

export type Message = {
  author: Scalars['Int']
  body: Scalars['String']
  chatId: Scalars['String']
  createdAt: Scalars['Int']
  id: Scalars['Int']
  replyTo?: Maybe<Scalars['Int']>
  seen?: Maybe<Scalars['Boolean']>
  updatedAt?: Maybe<Scalars['Int']>
}

export enum MessageStatus {
  Deleted = 'DELETED',
  New = 'NEW',
  Updated = 'UPDATED'
}

export type MessagesBy = {
  author?: InputMaybe<Scalars['String']>
  body?: InputMaybe<Scalars['String']>
  chat?: InputMaybe<Scalars['String']>
  days?: InputMaybe<Scalars['Int']>
  order?: InputMaybe<Scalars['String']>
  stat?: InputMaybe<Scalars['String']>
}

export type Mutation = {
  confirmEmail: AuthResult
  createChat: Result
  createMessage: Result
  createReaction: Result
  createShout: Result
  createTopic: Result
  deleteChat: Result
  deleteMessage: Result
  deleteReaction: Result
  deleteShout: Result
  destroyTopic: Result
  follow: Result
  getSession: AuthResult
  markAllNotificationsAsRead: Result
  markAsRead: Result
  markNotificationAsRead: Result
  rateUser: Result
  registerUser: AuthResult
  sendLink: Result
  unfollow: Result
  updateChat: Result
  updateMessage: Result
  updateProfile: Result
  updateReaction: Result
  updateShout: Result
  updateTopic: Result
}

export type MutationConfirmEmailArgs = {
  token: Scalars['String']
}

export type MutationCreateChatArgs = {
  members: Array<InputMaybe<Scalars['Int']>>
  title?: InputMaybe<Scalars['String']>
}

export type MutationCreateMessageArgs = {
  body: Scalars['String']
  chat: Scalars['String']
  replyTo?: InputMaybe<Scalars['Int']>
}

export type MutationCreateReactionArgs = {
  reaction: ReactionInput
}

export type MutationCreateShoutArgs = {
  inp: ShoutInput
}

export type MutationCreateTopicArgs = {
  input: TopicInput
}

export type MutationDeleteChatArgs = {
  chatId: Scalars['String']
}

export type MutationDeleteMessageArgs = {
  chatId: Scalars['String']
  id: Scalars['Int']
}

export type MutationDeleteReactionArgs = {
  id: Scalars['Int']
}

export type MutationDeleteShoutArgs = {
  shout_id: Scalars['Int']
}

export type MutationDestroyTopicArgs = {
  slug: Scalars['String']
}

export type MutationFollowArgs = {
  slug: Scalars['String']
  what: FollowingEntity
}

export type MutationMarkAsReadArgs = {
  chatId: Scalars['String']
  ids: Array<InputMaybe<Scalars['Int']>>
}

export type MutationMarkNotificationAsReadArgs = {
  notification_id: Scalars['Int']
}

export type MutationRateUserArgs = {
  slug: Scalars['String']
  value: Scalars['Int']
}

export type MutationRegisterUserArgs = {
  email: Scalars['String']
  name?: InputMaybe<Scalars['String']>
  password?: InputMaybe<Scalars['String']>
}

export type MutationSendLinkArgs = {
  email: Scalars['String']
  lang?: InputMaybe<Scalars['String']>
  template?: InputMaybe<Scalars['String']>
}

export type MutationUnfollowArgs = {
  slug: Scalars['String']
  what: FollowingEntity
}

export type MutationUpdateChatArgs = {
  chat: ChatInput
}

export type MutationUpdateMessageArgs = {
  body: Scalars['String']
  chatId: Scalars['String']
  id: Scalars['Int']
}

export type MutationUpdateProfileArgs = {
  profile: ProfileInput
}

export type MutationUpdateReactionArgs = {
  id: Scalars['Int']
  reaction: ReactionInput
}

export type MutationUpdateShoutArgs = {
  publish?: InputMaybe<Scalars['Boolean']>
  shout_id: Scalars['Int']
  shout_input?: InputMaybe<ShoutInput>
}

export type MutationUpdateTopicArgs = {
  input: TopicInput
}

export type Notification = {
  createdAt: Scalars['DateTime']
  data?: Maybe<Scalars['String']>
  id: Scalars['Int']
  occurrences: Scalars['Int']
  reaction?: Maybe<Scalars['Int']>
  seen: Scalars['Boolean']
  shout?: Maybe<Scalars['Int']>
  type?: Maybe<NotificationType>
}

export enum NotificationType {
  NewComment = 'NEW_COMMENT',
  NewReply = 'NEW_REPLY',
  NewFollower = 'NEW_FOLLOWER',
  NewShout = 'NEW_SHOUT',
  NewLike = 'NEW_LIKE',
  NewDislike = 'NEW_DISLIKE'
}

export type NotificationsQueryParams = {
  limit?: InputMaybe<Scalars['Int']>
  offset?: InputMaybe<Scalars['Int']>
}

export type NotificationsQueryResult = {
  notifications: Array<Maybe<Notification>>
  totalCount: Scalars['Int']
  totalUnreadCount: Scalars['Int']
}

export type Operation = {
  id: Scalars['Int']
  name: Scalars['String']
}

export type Permission = {
  operation: Scalars['Int']
  resource: Scalars['Int']
}

export type ProfileInput = {
  about?: InputMaybe<Scalars['String']>
  bio?: InputMaybe<Scalars['String']>
  links?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  name?: InputMaybe<Scalars['String']>
  slug?: InputMaybe<Scalars['String']>
  userpic?: InputMaybe<Scalars['String']>
}

export type Query = {
  authorsAll: Array<Maybe<Author>>
  getAuthor?: Maybe<Author>
  getTopic?: Maybe<Topic>
  isEmailUsed: Scalars['Boolean']
  loadAuthorsBy: Array<Maybe<Author>>
  loadChats: Result
  loadDrafts: Array<Maybe<Shout>>
  loadMessagesBy: Result
  loadNotifications: NotificationsQueryResult
  loadReactionsBy: Array<Maybe<Reaction>>
  loadRecipients: Result
  loadShout?: Maybe<Shout>
  loadShouts: Array<Maybe<Shout>>
  markdownBody: Scalars['String']
  myFeed?: Maybe<Array<Maybe<Shout>>>
  searchMessages: Result
  searchRecipients: Result
  signIn: AuthResult
  signOut: AuthResult
  topicsAll: Array<Maybe<Topic>>
  topicsByAuthor: Array<Maybe<Topic>>
  topicsByCommunity: Array<Maybe<Topic>>
  topicsRandom: Array<Maybe<Topic>>
  userFollowedAuthors: Array<Maybe<Author>>
  userFollowedTopics: Array<Maybe<Topic>>
  userFollowers: Array<Maybe<Author>>
}

export type QueryGetAuthorArgs = {
  slug: Scalars['String']
}

export type QueryGetTopicArgs = {
  slug: Scalars['String']
}

export type QueryIsEmailUsedArgs = {
  email: Scalars['String']
}

export type QueryLoadAuthorsByArgs = {
  by?: InputMaybe<AuthorsBy>
  limit?: InputMaybe<Scalars['Int']>
  offset?: InputMaybe<Scalars['Int']>
}

export type QueryLoadChatsArgs = {
  limit?: InputMaybe<Scalars['Int']>
  offset?: InputMaybe<Scalars['Int']>
}

export type QueryLoadMessagesByArgs = {
  by: MessagesBy
  limit?: InputMaybe<Scalars['Int']>
  offset?: InputMaybe<Scalars['Int']>
}

export type QueryLoadNotificationsArgs = {
  params: NotificationsQueryParams
}

export type QueryLoadReactionsByArgs = {
  by: ReactionBy
  limit?: InputMaybe<Scalars['Int']>
  offset?: InputMaybe<Scalars['Int']>
}

export type QueryLoadRecipientsArgs = {
  limit?: InputMaybe<Scalars['Int']>
  offset?: InputMaybe<Scalars['Int']>
}

export type QueryLoadShoutArgs = {
  shout_id?: InputMaybe<Scalars['Int']>
  slug?: InputMaybe<Scalars['String']>
}

export type QueryLoadShoutsArgs = {
  options?: InputMaybe<LoadShoutsOptions>
}

export type QueryMarkdownBodyArgs = {
  body: Scalars['String']
}

export type QueryMyFeedArgs = {
  options?: InputMaybe<LoadShoutsOptions>
}

export type QuerySearchMessagesArgs = {
  by: MessagesBy
  limit?: InputMaybe<Scalars['Int']>
  offset?: InputMaybe<Scalars['Int']>
}

export type QuerySearchRecipientsArgs = {
  limit?: InputMaybe<Scalars['Int']>
  offset?: InputMaybe<Scalars['Int']>
  query: Scalars['String']
}

export type QuerySignInArgs = {
  email: Scalars['String']
  lang?: InputMaybe<Scalars['String']>
  password?: InputMaybe<Scalars['String']>
}

export type QueryTopicsByAuthorArgs = {
  author: Scalars['String']
}

export type QueryTopicsByCommunityArgs = {
  community: Scalars['String']
}

export type QueryTopicsRandomArgs = {
  amount?: InputMaybe<Scalars['Int']>
}

export type QueryUserFollowedAuthorsArgs = {
  slug: Scalars['String']
}

export type QueryUserFollowedTopicsArgs = {
  slug: Scalars['String']
}

export type QueryUserFollowersArgs = {
  slug: Scalars['String']
}

export type Rating = {
  rater: Scalars['String']
  value: Scalars['Int']
}

export type Reaction = {
  body?: Maybe<Scalars['String']>
  createdAt: Scalars['DateTime']
  createdBy: User
  deletedAt?: Maybe<Scalars['DateTime']>
  deletedBy?: Maybe<User>
  id: Scalars['Int']
  kind: ReactionKind
  old_id?: Maybe<Scalars['String']>
  old_thread?: Maybe<Scalars['String']>
  range?: Maybe<Scalars['String']>
  replyTo?: Maybe<Scalars['Int']>
  shout: Shout
  stat?: Maybe<Stat>
  updatedAt?: Maybe<Scalars['DateTime']>
}

export type ReactionBy = {
  comment?: InputMaybe<Scalars['Boolean']>
  createdBy?: InputMaybe<Scalars['String']>
  days?: InputMaybe<Scalars['Int']>
  search?: InputMaybe<Scalars['String']>
  shout?: InputMaybe<Scalars['String']>
  shouts?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  sort?: InputMaybe<Scalars['String']>
  topic?: InputMaybe<Scalars['String']>
}

export type ReactionInput = {
  body?: InputMaybe<Scalars['String']>
  kind: ReactionKind
  range?: InputMaybe<Scalars['String']>
  replyTo?: InputMaybe<Scalars['Int']>
  shout: Scalars['Int']
}

export enum ReactionKind {
  Accept = 'ACCEPT',
  Agree = 'AGREE',
  Ask = 'ASK',
  Comment = 'COMMENT',
  Disagree = 'DISAGREE',
  Dislike = 'DISLIKE',
  Disproof = 'DISPROOF',
  Footnote = 'FOOTNOTE',
  Like = 'LIKE',
  Proof = 'PROOF',
  Propose = 'PROPOSE',
  Quote = 'QUOTE',
  Reject = 'REJECT',
  Remark = 'REMARK'
}

export enum ReactionStatus {
  Changed = 'CHANGED',
  Deleted = 'DELETED',
  Explained = 'EXPLAINED',
  New = 'NEW',
  Updated = 'UPDATED'
}

export type ReactionUpdating = {
  error?: Maybe<Scalars['String']>
  reaction?: Maybe<Reaction>
  status?: Maybe<ReactionStatus>
}

export type Resource = {
  id: Scalars['Int']
  name: Scalars['String']
}

export type Result = {
  author?: Maybe<Author>
  authors?: Maybe<Array<Maybe<Author>>>
  chat?: Maybe<Chat>
  chats?: Maybe<Array<Maybe<Chat>>>
  communities?: Maybe<Array<Maybe<Community>>>
  community?: Maybe<Community>
  error?: Maybe<Scalars['String']>
  members?: Maybe<Array<Maybe<ChatMember>>>
  message?: Maybe<Message>
  messages?: Maybe<Array<Maybe<Message>>>
  reaction?: Maybe<Reaction>
  reactions?: Maybe<Array<Maybe<Reaction>>>
  shout?: Maybe<Shout>
  shouts?: Maybe<Array<Maybe<Shout>>>
  slugs?: Maybe<Array<Maybe<Scalars['String']>>>
  topic?: Maybe<Topic>
  topics?: Maybe<Array<Maybe<Topic>>>
}

export type Role = {
  community: Scalars['String']
  desc?: Maybe<Scalars['String']>
  id: Scalars['Int']
  name: Scalars['String']
  permissions: Array<Permission>
}

export type Shout = {
  authors?: Maybe<Array<Maybe<Author>>>
  body: Scalars['String']
  community?: Maybe<Scalars['String']>
  cover?: Maybe<Scalars['String']>
  createdAt: Scalars['DateTime']
  deletedAt?: Maybe<Scalars['DateTime']>
  deletedBy?: Maybe<User>
  description?: Maybe<Scalars['String']>
  id: Scalars['Int']
  lang?: Maybe<Scalars['String']>
  layout?: Maybe<Scalars['String']>
  lead?: Maybe<Scalars['String']>
  mainTopic?: Maybe<Scalars['String']>
  media?: Maybe<Scalars['String']>
  publishedAt?: Maybe<Scalars['DateTime']>
  slug: Scalars['String']
  stat?: Maybe<Stat>
  subtitle?: Maybe<Scalars['String']>
  title?: Maybe<Scalars['String']>
  topics?: Maybe<Array<Maybe<Topic>>>
  updatedAt?: Maybe<Scalars['DateTime']>
  updatedBy?: Maybe<User>
  versionOf?: Maybe<Scalars['String']>
  visibility?: Maybe<Scalars['String']>
}

export type ShoutInput = {
  authors?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  body?: InputMaybe<Scalars['String']>
  community?: InputMaybe<Scalars['Int']>
  cover?: InputMaybe<Scalars['String']>
  description?: InputMaybe<Scalars['String']>
  layout?: InputMaybe<Scalars['String']>
  lead?: InputMaybe<Scalars['String']>
  mainTopic?: InputMaybe<TopicInput>
  media?: InputMaybe<Scalars['String']>
  slug?: InputMaybe<Scalars['String']>
  subtitle?: InputMaybe<Scalars['String']>
  title?: InputMaybe<Scalars['String']>
  topics?: InputMaybe<Array<InputMaybe<TopicInput>>>
}

export type Stat = {
  commented?: Maybe<Scalars['Int']>
  ranking?: Maybe<Scalars['Int']>
  rating?: Maybe<Scalars['Int']>
  reacted?: Maybe<Scalars['Int']>
  viewed?: Maybe<Scalars['Int']>
}

export type Token = {
  createdAt: Scalars['DateTime']
  expiresAt?: Maybe<Scalars['DateTime']>
  id: Scalars['Int']
  ownerId: Scalars['Int']
  usedAt?: Maybe<Scalars['DateTime']>
  value: Scalars['String']
}

export type Topic = {
  body?: Maybe<Scalars['String']>
  id: Scalars['Int']
  oid?: Maybe<Scalars['String']>
  pic?: Maybe<Scalars['String']>
  slug: Scalars['String']
  stat?: Maybe<TopicStat>
  title?: Maybe<Scalars['String']>
}

export type TopicInput = {
  body?: InputMaybe<Scalars['String']>
  id?: InputMaybe<Scalars['Int']>
  pic?: InputMaybe<Scalars['String']>
  slug: Scalars['String']
  title?: InputMaybe<Scalars['String']>
}

export type TopicStat = {
  authors: Scalars['Int']
  followers: Scalars['Int']
  shouts: Scalars['Int']
}

export type User = {
  about?: Maybe<Scalars['String']>
  bio?: Maybe<Scalars['String']>
  communities?: Maybe<Array<Maybe<Scalars['Int']>>>
  createdAt: Scalars['DateTime']
  email?: Maybe<Scalars['String']>
  emailConfirmed?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
  lastSeen?: Maybe<Scalars['DateTime']>
  links?: Maybe<Array<Maybe<Scalars['String']>>>
  muted?: Maybe<Scalars['Boolean']>
  name?: Maybe<Scalars['String']>
  oauth?: Maybe<Scalars['String']>
  oid?: Maybe<Scalars['String']>
  password?: Maybe<Scalars['String']>
  ratings?: Maybe<Array<Maybe<Rating>>>
  slug: Scalars['String']
  updatedAt?: Maybe<Scalars['DateTime']>
  username: Scalars['String']
  userpic?: Maybe<Scalars['String']>
}

export type UserFollowings = {
  authors?: Maybe<Array<Maybe<Scalars['String']>>>
  communities?: Maybe<Array<Maybe<Scalars['String']>>>
  reactions?: Maybe<Array<Maybe<Scalars['Int']>>>
  topics?: Maybe<Array<Maybe<Scalars['String']>>>
  unread?: Maybe<Scalars['Int']>
}

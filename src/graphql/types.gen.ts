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
  DateTime: { input: any; output: any }
}

export type AuthResult = {
  error?: Maybe<Scalars['String']['output']>
  token?: Maybe<Scalars['String']['output']>
  user?: Maybe<User>
}

export type Author = {
  about?: Maybe<Scalars['String']['output']>
  bio?: Maybe<Scalars['String']['output']>
  caption?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  id: Scalars['Int']['output']
  lastSeen?: Maybe<Scalars['DateTime']['output']>
  links?: Maybe<Array<Maybe<Scalars['String']['output']>>>
  name: Scalars['String']['output']
  roles?: Maybe<Array<Maybe<Role>>>
  slug: Scalars['String']['output']
  stat?: Maybe<AuthorStat>
  userpic?: Maybe<Scalars['String']['output']>
}

export type AuthorStat = {
  commented?: Maybe<Scalars['Int']['output']>
  followers?: Maybe<Scalars['Int']['output']>
  followings?: Maybe<Scalars['Int']['output']>
  rating?: Maybe<Scalars['Int']['output']>
  shouts?: Maybe<Scalars['Int']['output']>
}

export type AuthorsBy = {
  createdAt?: InputMaybe<Scalars['DateTime']['input']>
  days?: InputMaybe<Scalars['Int']['input']>
  lastSeen?: InputMaybe<Scalars['DateTime']['input']>
  name?: InputMaybe<Scalars['String']['input']>
  order?: InputMaybe<Scalars['String']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  stat?: InputMaybe<Scalars['String']['input']>
  topic?: InputMaybe<Scalars['String']['input']>
}

export type Chat = {
  admins?: Maybe<Array<Maybe<Scalars['Int']['output']>>>
  createdAt: Scalars['Int']['output']
  createdBy: Scalars['Int']['output']
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['String']['output']
  members?: Maybe<Array<Maybe<ChatMember>>>
  messages?: Maybe<Array<Maybe<Message>>>
  private?: Maybe<Scalars['Boolean']['output']>
  title?: Maybe<Scalars['String']['output']>
  unread?: Maybe<Scalars['Int']['output']>
  updatedAt: Scalars['Int']['output']
  users?: Maybe<Array<Maybe<Scalars['Int']['output']>>>
}

export type ChatInput = {
  description?: InputMaybe<Scalars['String']['input']>
  id: Scalars['String']['input']
  title?: InputMaybe<Scalars['String']['input']>
}

export type ChatMember = {
  id: Scalars['Int']['output']
  lastSeen?: Maybe<Scalars['DateTime']['output']>
  name: Scalars['String']['output']
  online?: Maybe<Scalars['Boolean']['output']>
  slug: Scalars['String']['output']
  userpic?: Maybe<Scalars['String']['output']>
}

export type Collection = {
  amount?: Maybe<Scalars['Int']['output']>
  createdAt: Scalars['DateTime']['output']
  createdBy: User
  desc?: Maybe<Scalars['String']['output']>
  id: Scalars['Int']['output']
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  slug: Scalars['String']['output']
  title: Scalars['String']['output']
}

export type Community = {
  createdAt: Scalars['DateTime']['output']
  createdBy: User
  desc?: Maybe<Scalars['String']['output']>
  id: Scalars['Int']['output']
  name: Scalars['String']['output']
  pic: Scalars['String']['output']
  slug: Scalars['String']['output']
}

export enum FollowingEntity {
  Author = 'AUTHOR',
  Community = 'COMMUNITY',
  Reactions = 'REACTIONS',
  Topic = 'TOPIC',
}

export type LoadRandomTopShoutsParams = {
  filters?: InputMaybe<LoadShoutsFilters>
  fromRandomCount?: InputMaybe<Scalars['Int']['input']>
  limit: Scalars['Int']['input']
}

export type LoadShoutsFilters = {
  author?: InputMaybe<Scalars['String']['input']>
  excludeLayout?: InputMaybe<Scalars['String']['input']>
  fromDate?: InputMaybe<Scalars['String']['input']>
  layout?: InputMaybe<Scalars['String']['input']>
  reacted?: InputMaybe<Scalars['Boolean']['input']>
  toDate?: InputMaybe<Scalars['String']['input']>
  topic?: InputMaybe<Scalars['String']['input']>
  visibility?: InputMaybe<Scalars['String']['input']>
}

export type LoadShoutsOptions = {
  filters?: InputMaybe<LoadShoutsFilters>
  limit: Scalars['Int']['input']
  offset?: InputMaybe<Scalars['Int']['input']>
  order_by?: InputMaybe<Scalars['String']['input']>
  order_by_desc?: InputMaybe<Scalars['Boolean']['input']>
  with_author_captions?: InputMaybe<Scalars['Boolean']['input']>
}

export type Message = {
  author: Scalars['Int']['output']
  body: Scalars['String']['output']
  chatId: Scalars['String']['output']
  createdAt: Scalars['Int']['output']
  id: Scalars['Int']['output']
  replyTo?: Maybe<Scalars['Int']['output']>
  seen?: Maybe<Scalars['Boolean']['output']>
  updatedAt?: Maybe<Scalars['Int']['output']>
}

export enum MessageStatus {
  Deleted = 'DELETED',
  New = 'NEW',
  Updated = 'UPDATED',
}

export type MessagesBy = {
  author?: InputMaybe<Scalars['String']['input']>
  body?: InputMaybe<Scalars['String']['input']>
  chat?: InputMaybe<Scalars['String']['input']>
  days?: InputMaybe<Scalars['Int']['input']>
  order?: InputMaybe<Scalars['String']['input']>
  stat?: InputMaybe<Scalars['String']['input']>
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
  token: Scalars['String']['input']
}

export type MutationCreateChatArgs = {
  members: Array<InputMaybe<Scalars['Int']['input']>>
  title?: InputMaybe<Scalars['String']['input']>
}

export type MutationCreateMessageArgs = {
  body: Scalars['String']['input']
  chat: Scalars['String']['input']
  replyTo?: InputMaybe<Scalars['Int']['input']>
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
  chatId: Scalars['String']['input']
}

export type MutationDeleteMessageArgs = {
  chatId: Scalars['String']['input']
  id: Scalars['Int']['input']
}

export type MutationDeleteReactionArgs = {
  id: Scalars['Int']['input']
}

export type MutationDeleteShoutArgs = {
  shout_id: Scalars['Int']['input']
}

export type MutationDestroyTopicArgs = {
  slug: Scalars['String']['input']
}

export type MutationFollowArgs = {
  slug: Scalars['String']['input']
  what: FollowingEntity
}

export type MutationMarkAsReadArgs = {
  chatId: Scalars['String']['input']
  ids: Array<InputMaybe<Scalars['Int']['input']>>
}

export type MutationMarkNotificationAsReadArgs = {
  notification_id: Scalars['Int']['input']
}

export type MutationRateUserArgs = {
  slug: Scalars['String']['input']
  value: Scalars['Int']['input']
}

export type MutationRegisterUserArgs = {
  email: Scalars['String']['input']
  name?: InputMaybe<Scalars['String']['input']>
  password?: InputMaybe<Scalars['String']['input']>
}

export type MutationSendLinkArgs = {
  email: Scalars['String']['input']
  lang?: InputMaybe<Scalars['String']['input']>
  template?: InputMaybe<Scalars['String']['input']>
}

export type MutationUnfollowArgs = {
  slug: Scalars['String']['input']
  what: FollowingEntity
}

export type MutationUpdateChatArgs = {
  chat: ChatInput
}

export type MutationUpdateMessageArgs = {
  body: Scalars['String']['input']
  chatId: Scalars['String']['input']
  id: Scalars['Int']['input']
}

export type MutationUpdateProfileArgs = {
  profile: ProfileInput
}

export type MutationUpdateReactionArgs = {
  id: Scalars['Int']['input']
  reaction: ReactionInput
}

export type MutationUpdateShoutArgs = {
  publish?: InputMaybe<Scalars['Boolean']['input']>
  shout_id: Scalars['Int']['input']
  shout_input?: InputMaybe<ShoutInput>
}

export type MutationUpdateTopicArgs = {
  input: TopicInput
}

export type MySubscriptionsQueryResult = {
  authors: Array<Maybe<Author>>
  topics: Array<Maybe<Topic>>
}

export type Notification = {
  createdAt: Scalars['DateTime']['output']
  data?: Maybe<Scalars['String']['output']>
  id: Scalars['Int']['output']
  occurrences: Scalars['Int']['output']
  reaction?: Maybe<Scalars['Int']['output']>
  seen: Scalars['Boolean']['output']
  shout?: Maybe<Scalars['Int']['output']>
  type: NotificationType
}

export enum NotificationType {
  NewComment = 'NEW_COMMENT',
  NewReply = 'NEW_REPLY',
}

export type NotificationsQueryParams = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type NotificationsQueryResult = {
  notifications: Array<Maybe<Notification>>
  totalCount: Scalars['Int']['output']
  totalUnreadCount: Scalars['Int']['output']
}

export type Operation = {
  id: Scalars['Int']['output']
  name: Scalars['String']['output']
}

export type Permission = {
  operation: Scalars['Int']['output']
  resource: Scalars['Int']['output']
}

export type ProfileInput = {
  about?: InputMaybe<Scalars['String']['input']>
  bio?: InputMaybe<Scalars['String']['input']>
  links?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  name?: InputMaybe<Scalars['String']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  userpic?: InputMaybe<Scalars['String']['input']>
}

export type Query = {
  authorsAll: Array<Maybe<Author>>
  getAuthor?: Maybe<Author>
  getTopic?: Maybe<Topic>
  isEmailUsed: Scalars['Boolean']['output']
  loadAuthorsBy: Array<Maybe<Author>>
  loadChats: Result
  loadDrafts: Array<Maybe<Shout>>
  loadMessagesBy: Result
  loadMySubscriptions?: Maybe<MySubscriptionsQueryResult>
  loadNotifications: NotificationsQueryResult
  loadRandomTopShouts: Array<Maybe<Shout>>
  loadReactionsBy: Array<Maybe<Reaction>>
  loadRecipients: Result
  loadShout?: Maybe<Shout>
  loadShouts: Array<Maybe<Shout>>
  markdownBody: Scalars['String']['output']
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
  slug: Scalars['String']['input']
}

export type QueryGetTopicArgs = {
  slug: Scalars['String']['input']
}

export type QueryIsEmailUsedArgs = {
  email: Scalars['String']['input']
}

export type QueryLoadAuthorsByArgs = {
  by?: InputMaybe<AuthorsBy>
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoadChatsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoadMessagesByArgs = {
  by: MessagesBy
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoadNotificationsArgs = {
  params: NotificationsQueryParams
}

export type QueryLoadRandomTopShoutsArgs = {
  params?: InputMaybe<LoadRandomTopShoutsParams>
}

export type QueryLoadReactionsByArgs = {
  by: ReactionBy
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoadRecipientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoadShoutArgs = {
  shout_id?: InputMaybe<Scalars['Int']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
}

export type QueryLoadShoutsArgs = {
  options?: InputMaybe<LoadShoutsOptions>
}

export type QueryMarkdownBodyArgs = {
  body: Scalars['String']['input']
}

export type QueryMyFeedArgs = {
  options?: InputMaybe<LoadShoutsOptions>
}

export type QuerySearchMessagesArgs = {
  by: MessagesBy
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QuerySearchRecipientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  query: Scalars['String']['input']
}

export type QuerySignInArgs = {
  email: Scalars['String']['input']
  lang?: InputMaybe<Scalars['String']['input']>
  password?: InputMaybe<Scalars['String']['input']>
}

export type QueryTopicsByAuthorArgs = {
  author: Scalars['String']['input']
}

export type QueryTopicsByCommunityArgs = {
  community: Scalars['String']['input']
}

export type QueryTopicsRandomArgs = {
  amount?: InputMaybe<Scalars['Int']['input']>
}

export type QueryUserFollowedAuthorsArgs = {
  slug: Scalars['String']['input']
}

export type QueryUserFollowedTopicsArgs = {
  slug: Scalars['String']['input']
}

export type QueryUserFollowersArgs = {
  slug: Scalars['String']['input']
}

export type Rating = {
  rater: Scalars['String']['output']
  value: Scalars['Int']['output']
}

export type Reaction = {
  body?: Maybe<Scalars['String']['output']>
  createdAt: Scalars['DateTime']['output']
  createdBy: User
  deletedAt?: Maybe<Scalars['DateTime']['output']>
  deletedBy?: Maybe<User>
  id: Scalars['Int']['output']
  kind: ReactionKind
  old_id?: Maybe<Scalars['String']['output']>
  old_thread?: Maybe<Scalars['String']['output']>
  range?: Maybe<Scalars['String']['output']>
  replyTo?: Maybe<Scalars['Int']['output']>
  shout: Shout
  stat?: Maybe<Stat>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type ReactionBy = {
  comment?: InputMaybe<Scalars['Boolean']['input']>
  createdBy?: InputMaybe<Scalars['String']['input']>
  days?: InputMaybe<Scalars['Int']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  shout?: InputMaybe<Scalars['String']['input']>
  shouts?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  sort?: InputMaybe<Scalars['String']['input']>
  topic?: InputMaybe<Scalars['String']['input']>
}

export type ReactionInput = {
  body?: InputMaybe<Scalars['String']['input']>
  kind: ReactionKind
  range?: InputMaybe<Scalars['String']['input']>
  replyTo?: InputMaybe<Scalars['Int']['input']>
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
  Footnote = 'FOOTNOTE',
  Like = 'LIKE',
  Proof = 'PROOF',
  Propose = 'PROPOSE',
  Quote = 'QUOTE',
  Reject = 'REJECT',
  Remark = 'REMARK',
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

export type Resource = {
  id: Scalars['Int']['output']
  name: Scalars['String']['output']
}

export type Result = {
  author?: Maybe<Author>
  authors?: Maybe<Array<Maybe<Author>>>
  chat?: Maybe<Chat>
  chats?: Maybe<Array<Maybe<Chat>>>
  communities?: Maybe<Array<Maybe<Community>>>
  community?: Maybe<Community>
  error?: Maybe<Scalars['String']['output']>
  members?: Maybe<Array<Maybe<ChatMember>>>
  message?: Maybe<Message>
  messages?: Maybe<Array<Maybe<Message>>>
  reaction?: Maybe<Reaction>
  reactions?: Maybe<Array<Maybe<Reaction>>>
  shout?: Maybe<Shout>
  shouts?: Maybe<Array<Maybe<Shout>>>
  slugs?: Maybe<Array<Maybe<Scalars['String']['output']>>>
  topic?: Maybe<Topic>
  topics?: Maybe<Array<Maybe<Topic>>>
}

export type Role = {
  community: Scalars['String']['output']
  desc?: Maybe<Scalars['String']['output']>
  id: Scalars['Int']['output']
  name: Scalars['String']['output']
  permissions: Array<Permission>
}

export type Shout = {
  authors?: Maybe<Array<Maybe<Author>>>
  body: Scalars['String']['output']
  community?: Maybe<Scalars['String']['output']>
  cover?: Maybe<Scalars['String']['output']>
  createdAt: Scalars['DateTime']['output']
  deletedAt?: Maybe<Scalars['DateTime']['output']>
  deletedBy?: Maybe<User>
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['Int']['output']
  lang?: Maybe<Scalars['String']['output']>
  layout?: Maybe<Scalars['String']['output']>
  lead?: Maybe<Scalars['String']['output']>
  mainTopic?: Maybe<Scalars['String']['output']>
  media?: Maybe<Scalars['String']['output']>
  publishedAt?: Maybe<Scalars['DateTime']['output']>
  slug: Scalars['String']['output']
  stat?: Maybe<Stat>
  subtitle?: Maybe<Scalars['String']['output']>
  title?: Maybe<Scalars['String']['output']>
  topics?: Maybe<Array<Maybe<Topic>>>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  updatedBy?: Maybe<User>
  versionOf?: Maybe<Scalars['String']['output']>
  visibility?: Maybe<Scalars['String']['output']>
}

export type ShoutInput = {
  authors?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  body?: InputMaybe<Scalars['String']['input']>
  community?: InputMaybe<Scalars['Int']['input']>
  cover?: InputMaybe<Scalars['String']['input']>
  description?: InputMaybe<Scalars['String']['input']>
  layout?: InputMaybe<Scalars['String']['input']>
  lead?: InputMaybe<Scalars['String']['input']>
  mainTopic?: InputMaybe<TopicInput>
  media?: InputMaybe<Scalars['String']['input']>
  slug?: InputMaybe<Scalars['String']['input']>
  subtitle?: InputMaybe<Scalars['String']['input']>
  title?: InputMaybe<Scalars['String']['input']>
  topics?: InputMaybe<Array<InputMaybe<TopicInput>>>
}

export type Stat = {
  commented?: Maybe<Scalars['Int']['output']>
  ranking?: Maybe<Scalars['Int']['output']>
  rating?: Maybe<Scalars['Int']['output']>
  reacted?: Maybe<Scalars['Int']['output']>
  viewed?: Maybe<Scalars['Int']['output']>
}

export type Token = {
  createdAt: Scalars['DateTime']['output']
  expiresAt?: Maybe<Scalars['DateTime']['output']>
  id: Scalars['Int']['output']
  ownerId: Scalars['Int']['output']
  usedAt?: Maybe<Scalars['DateTime']['output']>
  value: Scalars['String']['output']
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
  followers: Scalars['Int']['output']
  shouts: Scalars['Int']['output']
}

export type User = {
  about?: Maybe<Scalars['String']['output']>
  bio?: Maybe<Scalars['String']['output']>
  communities?: Maybe<Array<Maybe<Scalars['Int']['output']>>>
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  emailConfirmed?: Maybe<Scalars['Boolean']['output']>
  id: Scalars['Int']['output']
  lastSeen?: Maybe<Scalars['DateTime']['output']>
  links?: Maybe<Array<Maybe<Scalars['String']['output']>>>
  muted?: Maybe<Scalars['Boolean']['output']>
  name?: Maybe<Scalars['String']['output']>
  oauth?: Maybe<Scalars['String']['output']>
  oid?: Maybe<Scalars['String']['output']>
  password?: Maybe<Scalars['String']['output']>
  ratings?: Maybe<Array<Maybe<Rating>>>
  slug: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  username: Scalars['String']['output']
  userpic?: Maybe<Scalars['String']['output']>
}

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
  bio?: Maybe<Scalars['String']>
  caption?: Maybe<Scalars['String']>
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
  admins?: Maybe<Array<Maybe<User>>>
  createdAt: Scalars['Int']
  createdBy: User
  description?: Maybe<Scalars['String']>
  id: Scalars['String']
  messages: Array<Maybe<Message>>
  private?: Maybe<Scalars['Boolean']>
  title?: Maybe<Scalars['String']>
  unread?: Maybe<Scalars['Int']>
  updatedAt: Scalars['Int']
  users: Array<Maybe<User>>
}

export type ChatInput = {
  description?: InputMaybe<Scalars['String']>
  id: Scalars['String']
  title?: InputMaybe<Scalars['String']>
}

export type ChatMember = {
  invitedAt?: Maybe<Scalars['DateTime']>
  invitedBy?: Maybe<Scalars['String']>
  name: Scalars['String']
  slug: Scalars['String']
  userpic?: Maybe<Scalars['String']>
}

export type ChatUser = {
  id: Scalars['Int']
  lastSeen?: Maybe<Scalars['DateTime']>
  name: Scalars['String']
  slug: Scalars['String']
  userpic?: Maybe<Scalars['String']>
}

export type Collab = {
  authors: Array<Maybe<Scalars['String']>>
  body?: Maybe<Scalars['String']>
  createdAt: Scalars['DateTime']
  invites?: Maybe<Array<Maybe<Scalars['String']>>>
  title?: Maybe<Scalars['String']>
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
}

export type Message = {
  author: Scalars['String']
  body: Scalars['String']
  chatId: Scalars['String']
  createdAt: Scalars['Int']
  id: Scalars['Int']
  replyTo?: Maybe<Scalars['String']>
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
  inviteAuthor: Result
  inviteChat: Result
  markAsRead: Result
  rateUser: Result
  refreshSession: AuthResult
  registerUser: AuthResult
  removeAuthor: Result
  sendLink: Result
  unfollow: Result
  updateChat: Result
  updateMessage: Result
  updateOnlineStatus: Result
  updateProfile: Result
  updateReaction: Result
  updateShout: Result
  updateTopic: Result
}

export type MutationConfirmEmailArgs = {
  token: Scalars['String']
}

export type MutationCreateChatArgs = {
  members: Array<InputMaybe<Scalars['String']>>
  title?: InputMaybe<Scalars['String']>
}

export type MutationCreateMessageArgs = {
  body: Scalars['String']
  chat: Scalars['String']
  replyTo?: InputMaybe<Scalars['String']>
}

export type MutationCreateReactionArgs = {
  reaction: ReactionInput
}

export type MutationCreateShoutArgs = {
  input: ShoutInput
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
  slug: Scalars['String']
}

export type MutationDestroyTopicArgs = {
  slug: Scalars['String']
}

export type MutationFollowArgs = {
  slug: Scalars['String']
  what: FollowingEntity
}

export type MutationInviteAuthorArgs = {
  author: Scalars['String']
  shout: Scalars['String']
}

export type MutationInviteChatArgs = {
  chatId: Scalars['String']
  userslug: Scalars['String']
}

export type MutationMarkAsReadArgs = {
  chatId: Scalars['String']
  ids: Array<InputMaybe<Scalars['Int']>>
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

export type MutationRemoveAuthorArgs = {
  author: Scalars['String']
  shout: Scalars['String']
}

export type MutationSendLinkArgs = {
  email: Scalars['String']
  lang?: InputMaybe<Scalars['String']>
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
  reaction: ReactionInput
}

export type MutationUpdateShoutArgs = {
  input: ShoutInput
}

export type MutationUpdateTopicArgs = {
  input: TopicInput
}

export type Notification = {
  kind: Scalars['String']
  template: Scalars['String']
  variables?: Maybe<Array<Maybe<Scalars['String']>>>
}

export type Operation = {
  id: Scalars['Int']
  name: Scalars['String']
}

export type Permission = {
  operation_id: Scalars['Int']
  resource_id: Scalars['Int']
}

export type ProfileInput = {
  bio?: InputMaybe<Scalars['String']>
  links?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  name?: InputMaybe<Scalars['String']>
  userpic?: InputMaybe<Scalars['String']>
}

export type Query = {
  authorsAll: Array<Maybe<Author>>
  chatUsersAll: Array<Maybe<ChatUser>>
  getAuthor?: Maybe<User>
  getCollabs: Array<Maybe<Collab>>
  getTopic?: Maybe<Topic>
  isEmailUsed: Scalars['Boolean']
  loadAuthorsBy: Array<Maybe<Author>>
  loadChats: Result
  loadMessagesBy: Result
  loadReactionsBy: Array<Maybe<Reaction>>
  loadShout?: Maybe<Shout>
  loadShouts: Array<Maybe<Shout>>
  markdownBody: Scalars['String']
  searchUsers: Result
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

export type QueryLoadReactionsByArgs = {
  by: ReactionBy
  limit?: InputMaybe<Scalars['Int']>
  offset?: InputMaybe<Scalars['Int']>
}

export type QueryLoadShoutArgs = {
  slug: Scalars['String']
}

export type QueryLoadShoutsArgs = {
  options?: InputMaybe<LoadShoutsOptions>
}

export type QueryMarkdownBodyArgs = {
  body: Scalars['String']
}

export type QuerySearchUsersArgs = {
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
  replyTo?: Maybe<Reaction>
  shout: Shout
  stat?: Maybe<Stat>
  updatedAt?: Maybe<Scalars['DateTime']>
}

export type ReactionBy = {
  author?: InputMaybe<Scalars['String']>
  body?: InputMaybe<Scalars['String']>
  days?: InputMaybe<Scalars['Int']>
  order?: InputMaybe<Scalars['String']>
  shout?: InputMaybe<Scalars['String']>
  shouts?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  stat?: InputMaybe<Scalars['String']>
  topic?: InputMaybe<Scalars['String']>
}

export type ReactionInput = {
  body?: InputMaybe<Scalars['String']>
  kind: Scalars['Int']
  range?: InputMaybe<Scalars['String']>
  replyTo?: InputMaybe<Scalars['Int']>
  shout: Scalars['String']
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
  Reject = 'REJECT'
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
  uids?: Maybe<Array<Maybe<Scalars['String']>>>
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
  id: Scalars['Int']
  lang?: Maybe<Scalars['String']>
  layout?: Maybe<Scalars['String']>
  mainTopic?: Maybe<Scalars['String']>
  media?: Maybe<Scalars['String']>
  publishedAt?: Maybe<Scalars['DateTime']>
  publishedBy?: Maybe<User>
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
  body: Scalars['String']
  community: Scalars['String']
  mainTopic?: InputMaybe<Scalars['String']>
  slug: Scalars['String']
  subtitle?: InputMaybe<Scalars['String']>
  title?: InputMaybe<Scalars['String']>
  topic_slugs?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  versionOf?: InputMaybe<Scalars['String']>
  visibleForRoles?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  visibleForUsers?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
}

export type ShoutsFilterBy = {
  author?: InputMaybe<Scalars['String']>
  authors?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  body?: InputMaybe<Scalars['String']>
  days?: InputMaybe<Scalars['Int']>
  layout?: InputMaybe<Scalars['String']>
  slug?: InputMaybe<Scalars['String']>
  stat?: InputMaybe<Scalars['String']>
  title?: InputMaybe<Scalars['String']>
  topic?: InputMaybe<Scalars['String']>
  topics?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  visibility?: InputMaybe<Scalars['String']>
}

export type Stat = {
  commented?: Maybe<Scalars['Int']>
  ranking?: Maybe<Scalars['Int']>
  rating?: Maybe<Scalars['Int']>
  reacted?: Maybe<Scalars['Int']>
  viewed?: Maybe<Scalars['Int']>
}

export type Subscription = {
  newMessage: Message
  onlineUpdated: Array<User>
  reactionUpdated: ReactionUpdating
  shoutUpdated: Shout
  userUpdated: User
}

export type SubscriptionNewMessageArgs = {
  chats?: InputMaybe<Array<Scalars['Int']>>
}

export type SubscriptionReactionUpdatedArgs = {
  shout: Scalars['String']
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
  children?: Maybe<Array<Maybe<Scalars['String']>>>
  community: Community
  oid?: Maybe<Scalars['String']>
  parents?: Maybe<Array<Maybe<Scalars['String']>>>
  pic?: Maybe<Scalars['String']>
  slug: Scalars['String']
  stat?: Maybe<TopicStat>
  title?: Maybe<Scalars['String']>
}

export type TopicInput = {
  body?: InputMaybe<Scalars['String']>
  children?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  community: Scalars['String']
  parents?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  pic?: InputMaybe<Scalars['String']>
  slug: Scalars['String']
  title?: InputMaybe<Scalars['String']>
}

export type TopicStat = {
  authors: Scalars['Int']
  commented?: Maybe<Scalars['Int']>
  followers: Scalars['Int']
  rating?: Maybe<Scalars['Int']>
  reacted: Scalars['Int']
  shouts: Scalars['Int']
  viewed: Scalars['Int']
}

export type User = {
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
  notifications?: Maybe<Array<Maybe<Scalars['Int']>>>
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

export type UserNotification = {
  id: Scalars['Int']
  kind: Scalars['String']
  user: Scalars['Int']
  values?: Maybe<Array<Maybe<Scalars['String']>>>
}

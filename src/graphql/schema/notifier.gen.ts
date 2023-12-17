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

export type Mutation = {
  mark_all_notifications_as_read: NotificationSeenResult
  mark_notification_as_read: NotificationSeenResult
}

export type MutationMark_Notification_As_ReadArgs = {
  notification_id: Scalars['Int']['input']
}

export type Notification = {
  action: Scalars['String']['output']
  created_at: Scalars['Int']['output']
  entity: Scalars['String']['output']
  id: Scalars['Int']['output']
  payload: Scalars['String']['output']
  seen: Array<Scalars['Int']['output']>
}

export type NotificationSeenResult = {
  error?: Maybe<Scalars['String']['output']>
}

export type NotificationsResult = {
  notifications: Array<Notification>
  total: Scalars['Int']['output']
  unread: Scalars['Int']['output']
}

export type Query = {
  load_notifications: NotificationsResult
}

export type QueryLoad_NotificationsArgs = {
  limit?: Scalars['Int']['input']
  offset?: Scalars['Int']['input']
}

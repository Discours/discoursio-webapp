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

export type Chat = {
  admins?: Maybe<Array<Maybe<Scalars['Int']['output']>>>
  created_at: Scalars['Int']['output']
  created_by: Scalars['Int']['output']
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['String']['output']
  members?: Maybe<Array<Maybe<ChatMember>>>
  messages?: Maybe<Array<Maybe<Message>>>
  title?: Maybe<Scalars['String']['output']>
  unread?: Maybe<Scalars['Int']['output']>
  updated_at?: Maybe<Scalars['Int']['output']>
}

export type ChatInput = {
  description?: InputMaybe<Scalars['String']['input']>
  id: Scalars['String']['input']
  title?: InputMaybe<Scalars['String']['input']>
}

export type ChatMember = {
  id: Scalars['Int']['output']
  last_seen: Scalars['Int']['output']
  name: Scalars['String']['output']
  online?: Maybe<Scalars['Boolean']['output']>
  pic?: Maybe<Scalars['String']['output']>
  slug: Scalars['String']['output']
}

export type ChatResult = {
  chat?: Maybe<Chat>
  chats?: Maybe<Array<Maybe<Chat>>>
  error?: Maybe<Scalars['String']['output']>
  members?: Maybe<Array<Maybe<ChatMember>>>
  message?: Maybe<Message>
  messages?: Maybe<Array<Maybe<Message>>>
}

export type Message = {
  body: Scalars['String']['output']
  chat_id: Scalars['String']['output']
  created_at: Scalars['Int']['output']
  created_by: Scalars['Int']['output']
  id: Scalars['Int']['output']
  reply_to?: Maybe<Scalars['Int']['output']>
  seen?: Maybe<Scalars['Boolean']['output']>
  updated_at?: Maybe<Scalars['Int']['output']>
}

export type MessageInput = {
  body?: InputMaybe<Scalars['String']['input']>
  chat_id: Scalars['String']['input']
  id: Scalars['String']['input']
  seen?: InputMaybe<Scalars['Boolean']['input']>
}

export enum MessageStatus {
  Deleted = 'DELETED',
  New = 'NEW',
  Updated = 'UPDATED',
}

export type MessagesBy = {
  body?: InputMaybe<Scalars['String']['input']>
  chat?: InputMaybe<Scalars['String']['input']>
  created_by?: InputMaybe<Scalars['String']['input']>
  days?: InputMaybe<Scalars['Int']['input']>
  order?: InputMaybe<Scalars['String']['input']>
  stat?: InputMaybe<Scalars['String']['input']>
}

export type Mutation = {
  create_chat: ChatResult
  create_message: ChatResult
  delete_chat: ChatResult
  delete_message: ChatResult
  mark_as_read: ChatResult
  update_chat: ChatResult
  update_message: ChatResult
}

export type MutationCreate_ChatArgs = {
  members: Array<InputMaybe<Scalars['Int']['input']>>
  title?: InputMaybe<Scalars['String']['input']>
}

export type MutationCreate_MessageArgs = {
  body: Scalars['String']['input']
  chat_id: Scalars['String']['input']
  reply_to?: InputMaybe<Scalars['Int']['input']>
}

export type MutationDelete_ChatArgs = {
  chat_id: Scalars['String']['input']
}

export type MutationDelete_MessageArgs = {
  chat_id: Scalars['String']['input']
  message_id: Scalars['Int']['input']
}

export type MutationMark_As_ReadArgs = {
  chat_id: Scalars['String']['input']
  message_id: Scalars['Int']['input']
}

export type MutationUpdate_ChatArgs = {
  chat: ChatInput
}

export type MutationUpdate_MessageArgs = {
  message: MessageInput
}

export type Query = {
  load_chats: ChatResult
  load_messages_by: ChatResult
  load_recipients: ChatResult
  search_messages: ChatResult
  search_recipients: ChatResult
}

export type QueryLoad_ChatsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoad_Messages_ByArgs = {
  by: MessagesBy
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QueryLoad_RecipientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QuerySearch_MessagesArgs = {
  by: MessagesBy
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
}

export type QuerySearch_RecipientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  query: Scalars['String']['input']
}

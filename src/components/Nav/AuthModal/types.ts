export type AuthModalMode = 'login' | 'register' | 'confirm-email' | 'forgot-password'
export type AuthModalSource =
  | 'discussions'
  | 'vote'
  | 'subscribe'
  | 'bookmark'
  | 'follow'
  | 'create'
  | 'authguard'

export type AuthModalSearchParams = {
  mode: AuthModalMode
  source?: AuthModalSource
}

export type ConfirmEmailSearchParams = {
  access_token?: string
  token?: string
}

export type CreateChatSearchParams = {
  id: number
}

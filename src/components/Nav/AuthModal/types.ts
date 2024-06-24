import { AuthModalMode, AuthModalSource } from '~/context/ui'

export type AuthModalSearchParams = {
  mode: AuthModalMode
  source?: AuthModalSource
  token?: string
}

export type ConfirmEmailSearchParams = {
  access_token?: string
  token?: string
}

export type CreateChatSearchParams = {
  id: number
}
export type { AuthModalSource }

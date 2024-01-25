import { searchUrl } from './config'

type ApiErrorCode =
  | 'unknown'
  | 'email_not_confirmed'
  | 'user_not_found'
  | 'user_already_exists'
  | 'token_expired'
  | 'token_invalid'
  | 'duplicate_slug'

export class ApiError extends Error {
  code: ApiErrorCode

  constructor(code: ApiErrorCode, message?: string) {
    super(message)
    this.code = code
  }
}

export const apiClient = {
  getSearchResults: async (searchValue: string) => {
    return await fetch(`${searchUrl}/search?q=${searchValue}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8',
      },
    })
  },
}

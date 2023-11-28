type ApiErrorCode =
  | 'unknown'
  | 'email_not_confirmed'
  | 'user_not_found'
  | 'user_already_exists'
  | 'token_expired'
  | 'token_invalid'

export class ApiError extends Error {
  code: ApiErrorCode

  constructor(code: ApiErrorCode, message?: string) {
    super(message)
    this.code = code
  }
}

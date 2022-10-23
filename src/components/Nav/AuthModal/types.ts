export type AuthModalMode = 'login' | 'register' | 'confirm-email' | 'confirm-oauth' | 'forgot-password'

export type AuthModalSearchParams = {
  mode: AuthModalMode
}

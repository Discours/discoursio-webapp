import { ApiError } from '../error'
import authConfirmEmailMutation from '../mutation/_auth/auth-confirm-email'
import authLogoutQuery from '../mutation/_auth/auth-logout'
import authRegisterMutation from '../mutation/_auth/auth-register'
import authSendLinkMutation from '../mutation/_auth/auth-send-link'
import mySession from '../mutation/_auth/my-session'
import { getToken, getPrivateClient } from '../privateGraphQLClient'
import { getPublicClient } from '../publicGraphQLClient'
import authCheckEmailQuery from '../query/_auth/auth-check-email'
import authLoginQuery from '../query/_auth/auth-login'
import {
  ResendVerifyEmailInput,
  ResetPasswordInput,
  CreateUserInput,
  DeleteUserInput,
  UpdateUserInput,
  LoginInput,
  SignUpInput,
  MagicLinkLoginInput,
  AuthResponse,
} from '../schema/auth.gen'

export const authPublicGraphQLClient = getPublicClient('auth')
export const authPrivateGraphqlClient = getPrivateClient('auth')

export const authApiClient = {
  authLogin: async ({ email, password }: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await authPublicGraphQLClient.query(authLoginQuery, { email, password }).toPromise()
    // console.debug('[api-client] authLogin', { response })
    if (response.error) {
      if (
        response.error.message === '[GraphQL] User not found' ||
        response.error.message === "[GraphQL] 'dict' object has no attribute 'id'"
      ) {
        throw new ApiError('user_not_found')
      }

      throw new ApiError('unknown', response.error.message)
    }

    if (response.data.signIn.error) {
      if (response.data.signIn.error === 'please, confirm email') {
        throw new ApiError('email_not_confirmed')
      }

      throw new ApiError('unknown', response.data.signIn.error)
    }

    return response.data.signIn
  },
  authRegister: async ({
    email,
    password,
    name,
  }: {
    email: string
    password: string
    name: string
  }): Promise<void> => {
    const response = await authPublicGraphQLClient
      .mutation(authRegisterMutation, { email, password, name })
      .toPromise()

    if (response.error) {
      if (response.error.message === '[GraphQL] User already exist') {
        throw new ApiError('user_already_exists', response.error.message)
      }

      throw new ApiError('unknown', response.error.message)
    }
  },
  authSignOut: async () => {
    const response = await authPublicGraphQLClient.query(authLogoutQuery, {}).toPromise()
    return response.data.signOut
  },
  authCheckEmail: async ({ email }) => {
    // check if email is used
    const response = await authPublicGraphQLClient.query(authCheckEmailQuery, { email }).toPromise()
    return response.data.isEmailUsed
  },
  authSendLink: async ({ email, lang, template }) => {
    // send link with code on email
    const response = await authPublicGraphQLClient
      .mutation(authSendLinkMutation, { email, lang, template })
      .toPromise()

    if (response.error) {
      if (response.error.message === '[GraphQL] User not found') {
        throw new ApiError('user_not_found', response.error.message)
      }

      throw new ApiError('unknown', response.error.message)
    }

    if (response.data.sendLink.error) {
      throw new ApiError('unknown', response.data.sendLink.message)
    }

    return response.data.sendLink
  },
  confirmEmail: async ({ token }: { token: string }) => {
    // confirm email with code from link
    const response = await authPublicGraphQLClient.mutation(authConfirmEmailMutation, { token }).toPromise()
    if (response.error) {
      // TODO: better error communication
      if (response.error.message === '[GraphQL] check token lifetime') {
        throw new ApiError('token_expired', response.error.message)
      }

      if (response.error.message === '[GraphQL] token is not valid') {
        throw new ApiError('token_invalid', response.error.message)
      }

      throw new ApiError('unknown', response.error.message)
    }

    if (response.data?.confirmEmail?.error) {
      throw new ApiError('unknown', response.data?.confirmEmail?.error)
    }

    return response.data.confirmEmail
  },
  getSession: async (): Promise<AuthResponse> => {
    if (!getToken()) {
      return null
    }

    // renew session with auth token in header (!)
    const response = await authPrivateGraphqlClient.mutation(mySession, {}).toPromise()

    if (response.error) {
      throw new ApiError('unknown', response.error.message)
    }

    if (response.data?.getSession?.error) {
      throw new ApiError('unknown', response.data.getSession.error)
    }

    return response.data.getSession
  },
}

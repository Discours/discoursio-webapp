import { atom } from 'nanostores'
import type { AuthResult } from '../graphql/types.gen'
import { getLogger } from '../utils/logger'
import { resetToken, setToken } from '../graphql/privateGraphQLClient'
import { apiClient } from '../utils/apiClient'

const log = getLogger('auth-store')

export const session = atom<AuthResult>()

export const signIn = async (params) => {
  const s = await apiClient.authLogin(params)
  session.set(s)
  setToken(s.token)
  log.debug('signed in')
}

export const signUp = async (params) => {
  const s = await apiClient.authRegiser(params)
  session.set(s)
  setToken(s.token)
  log.debug('signed up')
}

export const signOut = () => {
  session.set(null)
  resetToken()
  log.debug('signed out')
}

export const emailChecks = atom<{ [email: string]: boolean }>({})

export const signCheck = async (params) => {
  emailChecks.set(await apiClient.authCheckEmail(params))
}

export const resetCode = atom<string>()

export const signSendLink = async (params) => {
  await apiClient.authSendLink(params) // { email }
  resetToken()
}

export const signConfirm = async (params) => {
  const auth = await apiClient.authConfirmCode(params) // { code }
  setToken(auth.token)
  session.set(auth)
}

export const renewSession = async () => {
  const s = await apiClient.getSession() // token in header
  setToken(s.token)
  session.set(s)
}

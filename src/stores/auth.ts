import { atom, action } from 'nanostores'
import type { AuthResult } from '../graphql/types.gen'
import { getLogger } from '../utils/logger'
import { resetToken, setToken } from '../graphql/privateGraphQLClient'
import { apiClient } from '../utils/apiClient'

const log = getLogger('auth-store')

export const session = atom<AuthResult>()

export const signIn = async (params) => {
  const s = await apiClient.signIn(params)
  session.set(s)
  setToken(s.token)
  log.debug('signed in')
}

export const signUp = async (params) => {
  const s = await apiClient.signUp(params)
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
  emailChecks.set(await apiClient.signCheck(params))
}

export const resetCode = atom<string>()

export const signReset = async (params) => {
  await apiClient.signReset(params) // { email }
  resetToken()
}

export const signResend = async (params) => {
  await apiClient.signResend(params) // { email }
}

export const signResetConfirm = async (params) => {
  const auth = await apiClient.signResetConfirm(params) // { code }
  setToken(auth.token)
  session.set(auth)
}

export const renewSession = async () => {
  const s = await apiClient.getSession() // token in header
  setToken(s.token)
  session.set(s)
}

import { atom, action } from 'nanostores'
import type { AuthResult } from '../graphql/types.gen'
import { getLogger } from '../utils/logger'
import { resetToken, setToken } from '../graphql/privateGraphQLClient'
import { apiClient } from '../utils/apiClient'

const log = getLogger('auth-store')

export const session = atom<AuthResult>()

export const signIn = action(session, 'signIn', async (store, params) => {
  const s = await apiClient.signIn(params)
  store.set(s)
  setToken(s.token)
  log.debug('signed in')
})

export const signUp = action(session, 'signUp', async (store, params) => {
  const s = await apiClient.signUp(params)
  store.set(s)
  setToken(s.token)
  log.debug('signed up')
})

export const signOut = action(session, 'signOut', (store) => {
  store.set(null)
  resetToken()
  log.debug('signed out')
})

export const emailChecks = atom<{ [email: string]: boolean }>({})

export const signCheck = action(emailChecks, 'signCheck', async (store, params) => {
  store.set(await apiClient.signCheck(params))
})

export const resetCode = atom<string>()

export const signReset = action(resetCode, 'signReset', async (_store, params) => {
  await apiClient.signReset(params) // { email }
  resetToken()
})

export const signResend = action(resetCode, 'signResend', async (_store, params) => {
  await apiClient.signResend(params) // { email }
})

export const signResetConfirm = action(session, 'signResetConfirm', async (store, params) => {
  const auth = await apiClient.signResetConfirm(params) // { code }
  setToken(auth.token)
  store.set(auth)
})

export const renewSession = action(session, 'renewSession', async (store) => {
  const s = await apiClient.getSession() // token in header
  setToken(s.token)
  store.set(s)
})

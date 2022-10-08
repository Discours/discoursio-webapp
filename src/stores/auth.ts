import { atom } from 'nanostores'
import type { AuthResult } from '../graphql/types.gen'
import { resetToken, setToken } from '../graphql/privateGraphQLClient'
import { apiClient } from '../utils/apiClient'
import { createSignal } from 'solid-js'

const [session, setSession] = createSignal<AuthResult | null>(null)

export const signIn = async (params) => {
  const authResult = await apiClient.authLogin(params)
  setSession(authResult)
  setToken(authResult.token)
  console.debug('signed in')
}

export const signUp = async (params) => {
  const authResult = await apiClient.authRegister(params)
  setSession(authResult)
  setToken(authResult.token)
  console.debug('signed up')
}

export const signOut = () => {
  setSession(null)
  resetToken()
  console.debug('signed out')
}

export const emailChecks = atom<{ [email: string]: boolean }>({})

export const signCheck = async (params) => {
  emailChecks.set(await apiClient.authCheckEmail(params))
}

export const resetCode = atom<string>()

export const register = async ({ email, password }: { email: string; password: string }) => {
  const authResult = await apiClient.authRegister({
    email,
    password
  })

  if (authResult && !authResult.error) {
    console.debug('register session update', authResult)
    setSession(authResult)
  }
}

export const signSendLink = async (params) => {
  await apiClient.authSendLink(params) // { email }
  resetToken()
}

export const signConfirm = async (params) => {
  const auth = await apiClient.authConfirmCode(params) // { code }
  setToken(auth.token)
  setSession(auth)
}

export const renewSession = async () => {
  const authResult = await apiClient.getSession() // token in header
  setToken(authResult.token)
  setSession(authResult)
}

export const useAuthStore = () => {
  return { session }
}

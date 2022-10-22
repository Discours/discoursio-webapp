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

export const signOut = () => {
  // TODO: call backend to revoke token
  setSession(null)
  resetToken()
  console.debug('signed out')
}

export const [emailChecks, setEmailChecks] = createSignal<{ [email: string]: boolean }>({})

export const checkEmail = async (email: string): Promise<boolean> => {
  if (emailChecks()[email]) {
    return true
  }

  const checkResult = await apiClient.authCheckEmail({ email })

  if (checkResult) {
    setEmailChecks((oldEmailChecks) => ({ ...oldEmailChecks, [email]: true }))
    return true
  }

  return false
}

export const [resetCode, setResetCode] = createSignal('')

export const register = async ({
  name,
  email,
  password
}: {
  name: string
  email: string
  password: string
}) => {
  await apiClient.authRegister({
    name,
    email,
    password
  })
}

export const signSendLink = async (params) => {
  await apiClient.authSendLink(params) // { email }
  resetToken()
}

export const renewSession = async () => {
  const authResult = await apiClient.getSession() // token in header
  setToken(authResult.token)
  setSession(authResult)
}

export const confirmEmail = async (token: string) => {
  const authResult = await apiClient.confirmEmail({ token })
  setToken(authResult.token)
  setSession(authResult)
}

export const useAuthStore = () => {
  return { session, emailChecks }
}

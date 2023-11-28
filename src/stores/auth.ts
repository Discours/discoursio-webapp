import { authApiClient as apiClient } from '../graphql/client/auth'

export const register = async ({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) => {
  await apiClient.authRegister({
    name,
    email,
    password,
  })
}

export const signSendLink = async ({
  email,
  lang,
  template,
}: {
  email: string
  lang: string
  template: string
}) => {
  return await apiClient.authSendLink({ email, lang, template })
}

import { MagicLinkLoginInput, SignupInput } from '@authorizerdev/authorizer-js'
import { useAuthorizer } from '../context/authorizer'

const [, { authorizer }] = useAuthorizer()

export const register = async ({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) => {
  const signupInput: SignupInput = {
    email,
    password,
    confirm_password: password,
  }
  await authorizer().signup(signupInput)
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
  return await authorizer().magicLinkLogin({ email } as MagicLinkLoginInput)
}

import * as Yup from 'yup'

const validators = {
  'sign-in': [
    { username: '', password: '' },
    {
      username: Yup.string().required(),
      password: Yup.string().required()
    }
  ],
  'sign-up': [
    { username: '', password: '', email: '' },
    {
      username: Yup.string(),
      email: Yup.string().email().required(),
      password: Yup.string().required()
    }
  ],
  forget: [{ email: '' }, { email: Yup.string().email().required() }],
  reset: [{ code: '' }, { code: Yup.string().required() }],
  resend: [{ email: '' }, { email: Yup.string().email().email().required() }],
  password: [
    { password: '', password2: '' },
    { password: Yup.string().required(), password2: Yup.string().required() }
  ]
}
export const useValidator = (name: string) => {
  return validators[name] || []
}

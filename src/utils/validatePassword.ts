import { useLocalize } from '../context/localize'

const { t } = useLocalize()
export const validatePassword = (passwordToCheck) => {
  const minLength = 8
  const hasNumber = /\d/
  const hasSpecial = /[!#$%&*@^]/

  if (passwordToCheck.length < minLength) {
    return t('Password should be at least 8 characters')
  }
  if (!hasNumber.test(passwordToCheck)) {
    return t('Password should contain at least one number')
  }
  if (!hasSpecial.test(passwordToCheck)) {
    return t('Password should contain at least one special character: !@#$%^&*')
  }
  return null
}

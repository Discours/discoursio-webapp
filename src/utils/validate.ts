export const validateEmail = (email: string) => {
  if (!email) return false

  return /^[\w%+.-]+@[\d.a-z-]+\.[a-z]{2,}$/i.test(email)
}

export const validateUrl = (value: string) => {
  // TODO: make it better
  return value.includes('.') && !value.includes(' ')
}

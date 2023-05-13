export const isValidEmail = (email: string) => {
  if (!email) {
    return false
  }

  return /^[\w%+.-]+@[\d.a-z-]+\.[a-z]{2,}$/i.test(email)
}

export const isValidEmail = (email: string) => {
  if (!email) {
    return false
  }

  return email.includes('@') && email.includes('.') && email.length > 5
}

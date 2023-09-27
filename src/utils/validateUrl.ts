export const validateUrl = (value: string) => {
  return value.includes('.') && !value.includes(' ')
}

export const validateUrl = (value: string) => {
  return /^((http|https):\/\/)?[^ "]+$/.test(value)
}

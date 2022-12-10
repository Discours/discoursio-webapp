const validateUrl = (value: string) => {
  return /^(http|https):\/\/[^ "]+$/.test(value)
}

export default validateUrl

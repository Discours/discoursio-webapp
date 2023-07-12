export const mediaItemsFromStringArray = (value: string[]) => {
  return value.map((url) => {
    return {
      url: url,
      source: '',
      title: '',
      body: ''
    }
  })
}

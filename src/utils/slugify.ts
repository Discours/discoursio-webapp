import { translit } from './ru2en'

export const slugify = (text) => {
  return translit(text.toLowerCase())
    .replaceAll(/[^\da-z]/g, '')
    .replaceAll(' ', '-')
}

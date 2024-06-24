import { translit } from './ru2en'

export const slugify = (text: string) => {
  return translit(text.toLowerCase())
    .replaceAll(' ', '-')
    .replaceAll(/[^\da-z]/g, '')
}

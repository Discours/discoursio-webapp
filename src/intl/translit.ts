import translitConfig from './abc-translit.json'
import { ruChars, slugChars } from './chars'

const ru2en: { [key: string]: string } = translitConfig
const rusChars = /[ЁА-яё]/
export const translit = (str: string) => {
  if (!str) {
    return ''
  }

  const isCyrillic = ruChars.test(str)

  if (!isCyrillic) {
    return str
  }

  return [...str].map((c) => ru2en[c] || c).join('')
}

export const slugify = (text: string) => {
  return translit(text.toLowerCase()).replaceAll(' ', '-').replaceAll(slugChars, '')
}

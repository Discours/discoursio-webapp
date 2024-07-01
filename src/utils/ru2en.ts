import translitConfig from '../config/translit.json'

const ru2en: { [key: string]: string } = translitConfig

export const translit = (str: string) => {
  if (!str) {
    return ''
  }

  const isCyrillic = /[ЁА-яё]/.test(str)

  if (!isCyrillic) {
    return str
  }

  return [...str].map((c) => ru2en[c] || c).join('')
}

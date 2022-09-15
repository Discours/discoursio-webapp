import ru from '../locales/ru.json'
// add locales here

const dict = { ru }

export const t = (s, lang = 'ru'): string => {
  try {
    return dict[lang][s]
  } catch {
    return s
  }
}

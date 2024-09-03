import i18next, { type i18n } from 'i18next'
import HttpApi from 'i18next-http-backend'
import ICU from 'i18next-icu'
import TimeAgo from 'javascript-time-ago'
import enTime from 'javascript-time-ago/locale/en'
import ruTime from 'javascript-time-ago/locale/ru'

TimeAgo.addLocale(enTime)
TimeAgo.addLocale(ruTime)

export const i18nextInit = async (lng = 'ru') => {
  if (!i18next.isInitialized) {
    console.debug('[i18next] initializing...')
    const en = await import('~/intl/locales/en/translation.json')
    const ru = await import('~/intl/locales/ru/translation.json')
    await i18next
      .use(HttpApi)
      .use(ICU)
      .init({
        // debug: true,
        supportedLngs: ['ru', 'en'],
        fallbackLng: 'en',
        lng,
        load: 'languageOnly',
        initImmediate: false,
        resources: {
          ru: { translation: ru },
          en: { translation: en }
        },
        interpolation: {
          escapeValue: false
        },
        parseMissingKeyHandler: (key: string) => key
      })
  } else if (i18next.language !== lng) {
    await i18next.changeLanguage(lng)
  }
}

export { TimeAgo, i18next, type i18n }

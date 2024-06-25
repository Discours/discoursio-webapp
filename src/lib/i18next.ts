import i18next, { type i18n } from 'i18next'
import HttpApi from 'i18next-http-backend'
import ICU from 'i18next-icu'
import TimeAgo from 'javascript-time-ago'
import enTime from 'javascript-time-ago/locale/en'
import ruTime from 'javascript-time-ago/locale/ru'
import en from './locales/en/translation.json'
import ru from './locales/ru/translation.json'


TimeAgo.addLocale(enTime)
TimeAgo.addLocale(ruTime)

export const i18nextInit = async (lng = 'ru') => {
  if (!i18next.isInitialized) {
    console.debug('[i18next] initializing...')
    // eslint-disable-next-line import/no-named-as-default-member
    await i18next
      .use(HttpApi)
      .use(ICU)
      .init({
        // debug: true,
        supportedLngs: ['ru', 'en'],
        fallbackLng: lng,
        lng,
        load: 'languageOnly',
        initImmediate: false,
        resources: {
          ru: { translation: ru },
          en: { translation: en },
        },
      })
    // console.debug(i18next)
  } else if (i18next.language !== lng) {
    await i18next.changeLanguage(lng)
  }

  // console.debug(`[i18next] using <${lng}>...`)
}
export { TimeAgo, i18next, type i18n }

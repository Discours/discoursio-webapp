import i18next, { type i18n } from 'i18next'
import HttpApi from 'i18next-http-backend'
import ICU from 'i18next-icu'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'

TimeAgo.addLocale(en)
TimeAgo.addLocale(ru)

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
          ru: { translation: await import('./locales/ru/translation.json') },
          en: { translation: await import('./locales/en/translation.json') },
        },
      })
    // console.debug(i18next)
  } else if (i18next.language !== lng) {
    await i18next.changeLanguage(lng)
  }

  // console.debug(`[i18next] using <${lng}>...`)
}
export { TimeAgo, i18next, type i18n }

import translate from 'google-translate-api-x'
import type { Shout } from '../graphql/types.gen'

export const translateHook = (aaa, locale) => {
  if (aaa?.length > 0) {
    console.log('[zine] articles loaded')
    if (locale !== 'ru') {
      // translate titles
      aaa.forEach((a: Shout) =>
        translate(a.title, { to: locale.get() }).then((res) => (a.title = res.text))
      )
    }
  }
  return aaa
}

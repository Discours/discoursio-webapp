import type { i18n } from 'i18next'
import type { Accessor, JSX } from 'solid-js'
import { createContext, createEffect, createMemo, createSignal, Show, useContext } from 'solid-js'
import { useRouter } from '../stores/router'
import i18next, { changeLanguage, t } from 'i18next'
import Cookie from 'js-cookie'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'

TimeAgo.addLocale(en)
TimeAgo.addLocale(ru)

type LocalizeContextType = {
  t: i18n['t']
  lang: Accessor<Language>
  setLang: (lang: Language) => void
  formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string
  formatTimeAgo: (date: Date) => string
}

export type Language = 'ru' | 'en'

const LocalizeContext = createContext<LocalizeContextType>()

export function useLocalize() {
  return useContext(LocalizeContext)
}

export const LocalizeProvider = (props: { children: JSX.Element }) => {
  const [lang, setLang] = createSignal<Language>(i18next.language === 'en' ? 'en' : 'ru')
  const { searchParams, changeSearchParam } = useRouter<{
    lng: string
  }>()

  createEffect(() => {
    if (!searchParams().lng) {
      return
    }

    const lng: Language = searchParams().lng === 'en' ? 'en' : 'ru'

    changeLanguage(lng)
    setLang(lng)
    Cookie.set('lng', lng)
    changeSearchParam({ lng: null }, true)
  })

  const formatTime = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
    const opts = Object.assign(
      {},
      {
        hour: '2-digit',
        minute: '2-digit',
      },
      options,
    )

    return date.toLocaleTimeString(lang(), opts)
  }

  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
    const opts = Object.assign(
      {},
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      },
      options,
    )

    let result = date.toLocaleDateString(lang(), opts)
    if (lang() === 'ru') {
      result = result.replace(' г.', '').replace('г.', '')
    }

    return result
  }

  const timeAgo = createMemo(() => new TimeAgo(lang()))

  const formatTimeAgo = (date: Date) => timeAgo().format(date)

  const value: LocalizeContextType = { t, lang, setLang, formatTime, formatDate, formatTimeAgo }

  return (
    <LocalizeContext.Provider value={value}>
      <Show when={lang()} keyed={true}>
        {props.children}
      </Show>
    </LocalizeContext.Provider>
  )
}

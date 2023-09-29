import type { i18n } from 'i18next'
import type { Accessor, JSX } from 'solid-js'
import { createContext, createEffect, createSignal, Show, useContext } from 'solid-js'
import { useRouter } from '../stores/router'
import i18next, { changeLanguage, t } from 'i18next'
import Cookie from 'js-cookie'

type LocalizeContextType = {
  t: i18n['t']
  lang: Accessor<Language>
  setLang: (lang: Language) => void
}

export type Language = 'ru' | 'en'

const LocalizeContext = createContext<LocalizeContextType>()

export function useLocalize() {
  return useContext(LocalizeContext)
}

export const LocalizeProvider = (props: { children: JSX.Element }) => {
  const [lang, setLang] = createSignal<Language>(i18next.language === 'en' ? 'en' : 'ru')
  const { searchParams, changeSearchParam } = useRouter<{ lng: string }>()

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

  const value: LocalizeContextType = { t, lang, setLang }

  return (
    <LocalizeContext.Provider value={value}>
      <Show when={lang()} keyed={true}>
        {props.children}
      </Show>
    </LocalizeContext.Provider>
  )
}

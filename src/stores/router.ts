import type { Accessor } from 'solid-js'
import { createRouter, createSearchParams } from '@nanostores/router'
import { isServer } from 'solid-js/web'
import { useStore } from '@nanostores/solid'

export const ROUTES = {
  home: '/',
  inbox: '/inbox',
  connect: '/connect',
  create: '/create',
  createSettings: '/create/settings',
  topics: '/topics',
  topic: '/topic/:slug',
  authors: '/authors',
  author: '/author/:slug',
  feed: '/feed',
  search: '/search/:q?',
  article: '/:slug',
  dogma: '/about/dogma',
  discussionRules: '/about/discussion-rules',
  guide: '/about/guide',
  help: '/about/help',
  manifest: '/about/manifest',
  partners: '/about/partners',
  principles: '/about/principles',
  projects: '/about/projects',
  termsOfUse: '/about/terms-of-use',
  thanks: '/about/thanks',
  expo: '/expo/:layout',
  profileSettings: '/profile/settings',
  profileSecurity: '/profile/security',
  profileSubscriptions: '/profile/subscriptions'
} as const

const searchParamsStore = createSearchParams()
const routerStore = createRouter(ROUTES, {
  search: false,
  links: false
})

export const router = routerStore

const handleClientRouteLinkClick = (event) => {
  const link = event.target.closest('a')
  if (
    link &&
    event.button === 0 &&
    link.target !== '_blank' &&
    link.rel !== 'external' &&
    !link.download &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  ) {
    const url = new URL(link.href)
    if (url.origin === location.origin) {
      event.preventDefault()

      if (url.hash) {
        let selector = url.hash

        if (/^#\d+/.test(selector)) {
          // id="1" fix
          // https://stackoverflow.com/questions/20306204/using-queryselector-with-ids-that-are-numbers
          selector = `[id="${selector.replace('#', '')}"]`
        }

        const anchor = document.querySelector(selector)
        const headerOffset = 80 // 100px for header
        const elementPosition = anchor ? anchor.getBoundingClientRect().top : 0
        const newScrollTop = elementPosition + window.scrollY - headerOffset

        window.scrollTo({
          top: newScrollTop,
          behavior: 'smooth'
        })

        return
      }

      routerStore.open(url.pathname)
      const params = Object.fromEntries(new URLSearchParams(url.search))
      searchParamsStore.open(params)

      window.scrollTo({
        top: 0,
        left: 0
      })
    }
  }
}

export const initRouter = (pathname: string, search: Record<string, string>) => {
  routerStore.open(pathname)
  const params = Object.fromEntries(new URLSearchParams(search))
  searchParamsStore.open(params)

  if (!isServer) {
    document.addEventListener('click', handleClientRouteLinkClick)
  }
}

if (!isServer) {
  const { pathname, search } = window.location
  const searchParams = Object.fromEntries(new URLSearchParams(search))
  initRouter(pathname, searchParams)
}

export const useRouter = <TSearchParams extends Record<string, string> = Record<string, string>>() => {
  const page = useStore(routerStore)
  const searchParams = useStore(searchParamsStore) as unknown as Accessor<TSearchParams>

  const changeSearchParam = <TKey extends keyof TSearchParams>(
    key: TKey,
    value: TSearchParams[TKey],
    replace = false
  ) => {
    const newSearchParams = { ...searchParamsStore.get() }
    if (value === null) {
      delete newSearchParams[key.toString()]
    } else {
      newSearchParams[key.toString()] = value
    }

    searchParamsStore.open(newSearchParams, replace)
  }

  return {
    page,
    searchParams,
    changeSearchParam,
    handleClientRouteLinkClick
  }
}

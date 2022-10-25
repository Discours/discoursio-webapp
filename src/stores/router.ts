import type { Accessor } from 'solid-js'
import { createRouter, createSearchParams } from '@nanostores/router'
import { isServer } from 'solid-js/web'
import { useStore } from '@nanostores/solid'

// TODO: more
export interface Routes {
  home: void
  create: void
  topics: void
  topic: 'slug'
  authors: void
  author: 'slug'
  feed: void
  article: 'slug'
  search: 'q'
  dogma: void
  guide: void
  help: void
  manifest: void
  partners: void
  projects: void
  termsOfUse: void
  thanks: void
}

const searchParamsStore = createSearchParams()
const routerStore = createRouter<Routes>(
  {
    home: '/',
    create: '/create',
    topics: '/topics',
    topic: '/topic/:slug',
    authors: '/authors',
    author: '/author/:slug',
    feed: '/feed',
    search: '/search/:q?',
    article: '/:slug',
    dogma: '/about/dogma',
    guide: '/about/guide',
    help: '/about/help',
    manifest: '/about/manifest',
    partners: '/about/partners',
    projects: '/about/projects',
    termsOfUse: '/about/terms-of-use',
    thanks: '/about/thanks'
  },
  {
    search: false,
    links: false
  }
)

export const router = routerStore

export const handleClientRouteLinkClick = (event) => {
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

export const initRouter = (pathname: string, search: string) => {
  routerStore.open(pathname)
  const params = Object.fromEntries(new URLSearchParams(search))
  searchParamsStore.open(params)
}

if (!isServer) {
  const { pathname, search } = window.location
  initRouter(pathname, search)
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
    changeSearchParam
  }
}

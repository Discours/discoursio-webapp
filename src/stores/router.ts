import type { Accessor } from 'solid-js'
import { createRouter, createSearchParams } from '@nanostores/router'
import { isServer } from 'solid-js/web'
import { useStore } from '@nanostores/solid'

// TODO: more
export interface Routes {
  home: void
  topics: void
  topic: 'slug'
  authors: void
  author: 'slug'
  feed: void
  article: 'slug'
  search: 'q'
}

const searchParamsStore = createSearchParams()
const routerStore = createRouter<Routes>(
  {
    home: '/',
    topics: '/topics',
    topic: '/topic/:slug',
    authors: '/authors',
    author: '/author/:slug',
    feed: '/feed',
    search: '/search/:q?',
    article: '/:slug'
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
      // TODO: search params
      routerStore.open(url.pathname)
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
  const getPage = useStore(routerStore)
  const getSearchParams = useStore(searchParamsStore) as unknown as Accessor<TSearchParams>

  const changeSearchParam = <TKey extends keyof TSearchParams>(key: TKey, value: TSearchParams[TKey]) => {
    searchParamsStore.open({ ...searchParamsStore.get(), [key]: value })
  }

  return {
    getPage,
    getSearchParams,
    changeSearchParam,
    initRouter
  }
}

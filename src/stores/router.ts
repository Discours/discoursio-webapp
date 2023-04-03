import type { Accessor } from 'solid-js'
import { createRouter, createSearchParams } from '@nanostores/router'
import { isServer } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { loadShoutPromise } from './zine/articles'
import { getPageLoadManagerPromise } from '../utils/pageLoadManager'

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

const checkOpenOnClient = (link: HTMLAnchorElement, event) => {
  return (
    link &&
    event.button === 0 &&
    link.target !== '_blank' &&
    link.rel !== 'external' &&
    !link.download &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

const scrollToHash = (hash: string) => {
  let selector = hash

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
}

const handleClientRouteLinkClick = async (event) => {
  const link = event.target.closest('a')

  if (!checkOpenOnClient(link, event)) {
    return
  }

  const url = new URL(link.href)
  if (url.origin !== location.origin) {
    return
  }

  event.preventDefault()

  if (url.pathname) {
    routerStore.open(url.pathname)
  }

  if (url.search) {
    const params = Object.fromEntries(new URLSearchParams(url.search))
    searchParamsStore.open(params)
  }

  if (!url.hash) {
    window.scrollTo({
      top: 0,
      left: 0
    })

    return
  }

  await getPageLoadManagerPromise()

  const images = document.querySelectorAll('img')

  let imagesLoaded = 0

  const imageLoadEventHandler = () => {
    imagesLoaded++
    if (imagesLoaded === images.length) {
      scrollToHash(url.hash)
      images.forEach((image) => image.removeEventListener('load', imageLoadEventHandler))
      images.forEach((image) => image.removeEventListener('error', imageLoadEventHandler))
    }
  }

  images.forEach((image) => {
    if (image.complete) {
      imagesLoaded++
    }

    image.addEventListener('load', imageLoadEventHandler)
    image.addEventListener('error', imageLoadEventHandler)
  })
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
    changeSearchParam
  }
}

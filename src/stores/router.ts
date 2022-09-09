import { createRouter } from '@nanostores/router'
import { createEffect, createSignal } from 'solid-js'
import { isServer } from 'solid-js/web'

// Types for :params in route templates
interface Routes {
  home: void // TODO: more
  topics: void
  authors: void
  feed: void
  post: 'slug'
  article: 'slug'
  expo: 'slug'
  create: 'collab'
  search: 'q'
  inbox: 'chat'
  author: 'slug'
  topic: 'slug'
}

export const router = createRouter<Routes>(
  {
    home: '/',
    topics: '/topics',
    authors: '/authors',
    feed: '/feed',
    create: '/create/:collab?',
    inbox: '/inbox/:chat?',
    search: '/search/:q?',
    post: '/:slug',
    article: '/articles/:slug',
    expo: '/expo/:layout/:topic/:slug',
    author: '/author/:slug',
    topic: '/topic/:slug'
  },
  {
    // enabling search query params passing
    search: true,
    links: false
  }
)

router.listen((r) => setResource(r.path))

// signals

const [pageState, setPage] = createSignal()
const [sizeState, setSize] = createSignal()

export type SortBy =
  | 'rating'
  | 'reacted'
  | 'commented'
  | 'viewed'
  | 'relevance'
  | 'topics'
  | 'authors'
  | 'shouts'
  | 'recent' // NOTE: not in Entity.stat
  | '' // abc

const [by, setBy] = createSignal<SortBy>('')
const [slug, setSlug] = createSignal('')
const [resource, setResource] = createSignal<string>(router?.get()?.path || '')

const isSlug = (s) =>
  Boolean(s) && // filter binded subroutes
  router.routes.filter((x) => x[0] === s).length === 0

const encodeParams = (dict) =>
  Object.entries(dict)
    .map((item: [string, string]) => (item[1] ? item[0] + '=' + encodeURIComponent(item[1]) + '&' : ''))
    .join('')
    .slice(0, -1)

const scanParams = (href) => {
  // FIXME parse query
  // console.debug('[router] read url to set store', href)
  // return href
  //   .split('?')
  //   .pop()
  //   .split('&')
  //   .forEach((arg: string) => {
  //     if (arg.startsWith('by=')) {
  //       setBy(arg.replace('by=', ''))
  //     } else if (arg.startsWith('page=')) {
  //       setPage(Number.parseInt(arg.replace('page=', '') || '0', 10))
  //     } else if (arg.startsWith('size=')) setSize(Number.parseInt(arg.replace('size=', '') || '0', 10))
  //   })
}
const _route = (ev) => {
  const href: string = ev.target.href
  console.log('[router] faster link', href)
  ev.stopPropoganation()
  ev.preventDefault()
  router.open(href)
  scanParams(href)
}

const route = (ev) => {
  if (typeof ev === 'function') {
    return _route
  } else if (!isServer && ev?.target && ev.target.href) {
    _route(ev)
  }
}

const updateParams = () => {
  // get request search query params
  const paramsDict = {
    by: by(), // sort name
    page: pageState(), // page number
    size: sizeState() // entries per page
    // TODO: add q for /search
  }
  console.log('[router] updated url with stored params')
  return paramsDict
}

const slugDetect = () => {
  const params = encodeParams(updateParams())
  const route = resource() + (params ? '?' + params : '')
  router.open(route) // window.pushState wrapper
  const s = resource()
    .split('/')
    .filter((x) => x.length > 0)
    .pop()
  if (isSlug(s)) {
    console.log('[router] detected slug {' + s + '}')
    setSlug(s)
  }
}

createEffect(slugDetect, [resource()])

if (!isServer) {
  console.log('[router] client runtime')
  createEffect(() => router.open(window.location.pathname), [window.location])
}

export { slug, route, setPage, setSize, by, setBy, resource }

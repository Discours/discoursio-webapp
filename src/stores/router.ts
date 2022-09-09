import { createRouter, createSearchParams } from '@nanostores/router'
import { onMount } from 'nanostores'
import { createEffect, createMemo, createSignal } from 'solid-js'
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

export const params = createSearchParams()
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

const [resource, setResource] = createSignal<string>('')
const slug = createMemo<string>(() => {
  const s = resource().split('/').pop()
  return (Boolean(s) && router.routes.filter((x) => x[0] === s).length === 0 && s) || ''
})

const _route = (ev) => {
  const href: string = ev.target.href
  console.log('[router] faster link', href)
  ev.stopPropoganation()
  ev.preventDefault()
  router.open(href)
}

const route = (ev) => {
  if (typeof ev === 'function') {
    return _route
  } else if (!isServer && ev?.target && ev.target.href) {
    _route(ev)
  }
}

if (!isServer) {
  console.log('[router] client runtime')
  createEffect(() => router.open(window.location.pathname), [window.location])
}

onMount(router, () => {
  router.listen((r) => setResource(r.path))
})

export { slug, route, resource }

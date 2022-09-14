import { createRouter, createSearchParams } from '@nanostores/router'
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

export const handleClientRouteLinkClick = (ev) => {
  const href = ev.target.href
  console.log('[router] faster link', href)
  ev.stopPropagation()
  ev.preventDefault()
  router.open(href)
}

if (!isServer) {
  const { pathname, search } = window.location
  router.open(pathname + search)
}

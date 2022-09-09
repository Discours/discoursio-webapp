import { cacheExchange, CacheExchangeOpts } from '@urql/exchange-graphcache'
// import schema from './introspec.gen'

export const cache = cacheExchange({
  // TODO: include introspection schema when needed
  keys: {
    Shout: (data) => data.slug,
    Author: (data) => data.slug,
    Topic: (data) => data.slug,
    Reaction: (data) => data.id
  }
} as CacheExchangeOpts)

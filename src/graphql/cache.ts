import { cacheExchange, CacheExchangeOpts } from '@urql/exchange-graphcache'

// import schema from './introspec.gen'
// NOTE: include codegened introspection schema when needed

// TODO: use urql-provided caching
export const cache = cacheExchange({
  keys: {
    Shout: (data) => data.slug,
    Author: (data) => data.slug,
    Topic: (data) => data.slug,
    Reaction: (data) => data.id
  }
} as CacheExchangeOpts)

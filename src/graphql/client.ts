import { createClient } from '@urql/core'
import { isDev } from '../utils/config'

const localClient = (options) => {
  const url = 'http://localhost:8080'
  let c
  try {
    c = createClient({ ...options, url })
    console.info('[graphql] using local client')
  } catch (error) {
    console.error(error)
    c = createClient(options)
    console.info(
      `[graphql] using ${options.url.replace('https://', '').replace('/graphql', '').replace('/', '')}`
    )
  }
  return c
}

export const initClient = (options) => {
  try {
    if (isDev) {
      console.info('[graphql] devmode detected')
      return localClient(options)
    } else return createClient(options)
  } catch (error) {
    console.error(error)
    return localClient(options)
  }
}

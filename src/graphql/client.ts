import { createClient } from '@urql/core'
import { isDev } from '../utils/config'

const localClient = (options) => {
  console.info('[graphql] using local client')
  const url = 'http://localhost:8080'
  return createClient({ ...options, url })
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

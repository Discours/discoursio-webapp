import { cookieStorage, createStorage } from '@solid-primitives/storage'

// https://start.solidjs.com/api/createCookieSessionStorage
export const [store, setStore, { remove }] = createStorage({
  api: cookieStorage,
  prefix: 'discoursio',
})
export const getToken = () => store.token
export const setToken = (value) => setStore('token', value)
export const resetToken = () => remove('token')

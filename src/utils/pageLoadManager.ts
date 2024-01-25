const pageLoadManager: {
  promise: Promise<void>
} = { promise: Promise.resolve() }

export const getPageLoadManagerPromise = () => {
  return pageLoadManager.promise
}
export const setPageLoadManagerPromise = (promise: Promise<void>) => {
  pageLoadManager.promise = promise
}

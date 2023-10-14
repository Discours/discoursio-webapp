const pageLoadManager: {
  promise: Promise<any>
} = { promise: Promise.resolve() }

export const getPageLoadManagerPromise = () => {
  return pageLoadManager.promise
}
export const setPageLoadManagerPromise = (promise: Promise<any>) => {
  pageLoadManager.promise = promise
}

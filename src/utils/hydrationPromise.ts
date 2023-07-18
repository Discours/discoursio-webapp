export let resolveHydrationPromise

export const hydrationPromise = new Promise((resolve) => {
  resolveHydrationPromise = resolve
})

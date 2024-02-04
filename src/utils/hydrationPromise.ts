export let resolveHydrationPromise: () => void

export const hydrationPromise: Promise<void> = new Promise((resolve) => {
  resolveHydrationPromise = resolve
})

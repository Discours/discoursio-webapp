export const debounce = (callback, delay) => {
  let isCooldown = false

  return function () {
    if (isCooldown) return

    callback.apply(this, arguments)

    isCooldown = true

    setTimeout(() => (isCooldown = false), delay)
  }
}

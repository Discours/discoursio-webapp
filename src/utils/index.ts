export const reflow = () => document.body.clientWidth

export const unique = (v) => {
  const s = new Set(v)
  return [...s]
}

export const preventSmoothScrollOnTabbing = () => {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return

    document.documentElement.style.scrollBehavior = ''

    setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'smooth'
    })
  })
}

export const capitalize = (originalString: string, firstonly = false) => {
  const s = originalString.trim()
  return firstonly
    ? s.charAt(0).toUpperCase() + s.slice(1)
    : s
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

export const plural = (amount: number, w: string[]) => {
  try {
    const a = amount.toString()
    const x = Number.parseInt(a.charAt(a.length - 1))
    const xx = Number.parseInt(a.charAt(a.length - 2) + a.charAt(a.length - 1))

    if (xx > 5 && xx < 20) return w[0]

    if (x === 1) return w[1]

    if (x > 1 && x < 5) return w[2]
  } catch (error) {
    console.error('[utils] plural error', error)
  }

  return w[0]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shuffle = (items: any[]) => {
  const cached = [...items]
  let temp
  let i = cached.length
  let rand

  while (--i) {
    rand = Math.floor(i * Math.random())
    temp = cached[rand]
    cached[rand] = cached[i]
    cached[i] = temp
  }

  return cached
}

export const snake2camel = (s: string) =>
  s
    .split(/(?=[A-Z])/)
    .join('-')
    .toLowerCase()

export const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
  const opts = Object.assign(
    {},
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    },
    options
  )

  return date.toLocaleDateString('ru', opts).replace(' г.', '')
}

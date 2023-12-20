export const capitalize = (originalString: string, firstonly = false) => {
  const s = (originalString || '').trim()
  return firstonly
    ? s.charAt(0).toUpperCase() + s.slice(1)
    : s
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

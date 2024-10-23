import { thumborUrl } from '~/config'

export const getFileUrl = (
  src: string,
  options: { width?: number; shout?: string | number; height?: number; noSizeUrlPart?: boolean } = {}
): string => {
  const parts = src
    .replace('assets.discours.io', 'files.dscrs.site')
    .replace('images.discours.io', 'files.dscrs.site')
    .replace('cdn.discours.io', 'files.dscrs.site')
    .split('.')
  let extension = parts.pop()
  let filepath = parts.join('.')
  if (options.width) {
    filepath = `${filepath}_${options.width}`
  }
  const basename = filepath.split('/').pop()
  if (options.shout) {
    extension = `${extension}?s=${options.shout}`
  }
  const result = `${thumborUrl}/${basename}.${extension}`
  // console.debug(`${src} -> ${result}`)
  return result
}

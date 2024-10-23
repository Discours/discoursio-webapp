import { thumborUrl } from '~/config'

export const getFileUrl = (
  src: string,
  options: { width?: number; shout?: string | number; height?: number; noSizeUrlPart?: boolean } = {}
): string => {
  const parts = src.split('.')
  let extension = parts.pop()
  let filepath = parts
    .join('.')
    .replace('assets.discours.io', 'files.dscrs.site')
    .replace('discours.io', 'dscrs.site')
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

import { isDev } from './config'
export const imageProxy = (url: string) => {
  return `${isDev ? 'https://new.discours.io' : ''}/api/image?url=${encodeURI(url)}`
}

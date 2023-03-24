import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'

export const Image = (props: JSX.ImgHTMLAttributes<HTMLImageElement>) => {
  const [local, others] = splitProps(props, ['src'])

  return <img src={`/api/image?url=${encodeURI(local.src)}`} {...others} />
}

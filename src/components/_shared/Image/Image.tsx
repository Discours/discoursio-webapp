import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { imageProxy } from '../../../utils/imageProxy'

export const Image = (props: JSX.ImgHTMLAttributes<HTMLImageElement>) => {
  const [local, others] = splitProps(props, ['src'])

  return <img src={imageProxy(local.src)} {...others} />
}

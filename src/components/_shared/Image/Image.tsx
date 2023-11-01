import { createMemo, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { getImageUrl } from '../../../utils/getImageUrl'

type Props = JSX.ImgHTMLAttributes<HTMLImageElement> & {
  width: number
  alt: string
}

export const Image = (props: Props) => {
  const [local, others] = splitProps(props, ['src', 'alt'])
  const src = getImageUrl(local.src, { width: others.width })
  return <img src={src} alt={local.alt} {...others} />
}

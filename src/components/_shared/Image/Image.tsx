import type { JSX } from 'solid-js'

import { Link } from '@solidjs/meta'
import { clsx } from 'clsx'
import { createSignal, onMount, splitProps } from 'solid-js'

import { getImageUrl } from '../../../utils/getImageUrl'

type Props = JSX.ImgHTMLAttributes<HTMLImageElement> & {
  width: number
  alt: string
}

export const Image = (props: Props) => {
  const [local, others] = splitProps(props, ['src', 'alt'])

  const imageUrl = getImageUrl(local.src, { width: others.width })

  return (
    <>
      <Link rel="preload" as="image" href={imageUrl} />
      <img src={imageUrl} alt={local.alt} {...others} />
    </>
  )
}

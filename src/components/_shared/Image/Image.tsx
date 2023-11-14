import type { JSX } from 'solid-js'

import { Link } from '@solidjs/meta'
import { clsx } from 'clsx'
import { createSignal, onMount, splitProps } from 'solid-js'

import { getImageUrl } from '../../../utils/getImageUrl'

import styles from './Image.module.scss'

type Props = JSX.ImgHTMLAttributes<HTMLImageElement> & {
  width: number
  alt: string
}

export const Image = (props: Props) => {
  const [local, others] = splitProps(props, ['src', 'alt', 'class'])
  const previewImageWidth = Math.ceil(others.width / 4)

  const previewImageUrl = getImageUrl(local.src, { width: previewImageWidth })

  const [src, setSrc] = createSignal(previewImageUrl)

  const imageUrl = getImageUrl(local.src, { width: others.width })

  onMount(() => {
    const image = new window.Image()
    image.addEventListener('load', () => {
      setSrc(imageUrl)
    })
    image.src = imageUrl
  })

  return (
    <>
      <Link rel="preload" as="image" href={imageUrl} />
      <img
        src={src()}
        alt={local.alt}
        class={clsx(styles.Image, local.class, {
          [styles.loading]: src() !== imageUrl,
        })}
        {...others}
      />
    </>
  )
}

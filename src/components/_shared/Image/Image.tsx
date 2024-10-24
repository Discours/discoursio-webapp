import type { JSX } from 'solid-js'

import { Link } from '@solidjs/meta'
import { splitProps } from 'solid-js'

import { getFileUrl } from '~/lib/getThumbUrl'

type Props = JSX.ImgHTMLAttributes<HTMLImageElement> & {
  width: number
  alt: string
}

export const Image = (props: Props) => {
  const [local, others] = splitProps(props, ['src', 'alt'])

  const imageUrl = local.src?.startsWith('http')
    ? getFileUrl(local.src, { width: others.width })
    : local.src

  const imageSrcSet = [1, 33, 66, 100]
    .map(
      (pixelDensity) =>
        `${
          local.src?.startsWith('http')
            ? getFileUrl(local.src || '', { width: others.width * pixelDensity })
            : local.src
        } ${pixelDensity}x`
    )
    .join(', ')
  return (
    <>
      <Link rel="preload" as="image" imagesrcset={imageSrcSet} href={imageUrl} />
      <img src={imageUrl} alt={local.alt} srcSet={imageSrcSet} {...others} />
    </>
  )
}

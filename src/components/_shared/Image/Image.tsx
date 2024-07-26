import type { JSX } from 'solid-js'

import { Link } from '@solidjs/meta'
import { splitProps } from 'solid-js'

import { getImageUrl } from '~/lib/getThumbUrl'

type Props = JSX.ImgHTMLAttributes<HTMLImageElement> & {
  width: number
  alt: string
}

export const Image = (props: Props) => {
  const [local, others] = splitProps(props, ['src', 'alt'])

  const imageUrl = getImageUrl(local.src || '', { width: others.width })

  const imageSrcSet = [1, 2, 3]
    .map(
      (pixelDensity) =>
        `${getImageUrl(local.src || '', { width: others.width * pixelDensity })} ${pixelDensity}x`
    )
    .join(', ')
  return (
    <>
      <Link rel="preload" as="image" imagesrcset={imageSrcSet} href={imageUrl} />
      <img src={imageUrl} alt={local.alt} srcSet={imageSrcSet} {...others} />
    </>
  )
}

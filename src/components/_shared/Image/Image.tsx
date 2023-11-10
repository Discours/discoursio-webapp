import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { getImageUrl } from '../../../utils/getImageUrl'
import styles from './Image.module.scss'

type Props = JSX.ImgHTMLAttributes<HTMLImageElement> & {
  width: number
  alt: string
}

export const Image = (props: Props) => {
  const [local, others] = splitProps(props, ['src', 'alt'])
  const src = getImageUrl(local.src, { width: others.width })
  return (
    <div class={styles.Image}>
      <button class={styles.openLightBox}>OPEN</button>
      <img src={src} alt={local.alt} {...others} />
    </div>
  )
}

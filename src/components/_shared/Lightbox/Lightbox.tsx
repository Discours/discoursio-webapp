import { clsx } from 'clsx'
import styles from './Lightbox.module.scss'
import { createSignal } from 'solid-js'
import { Icon } from '../Icon'

type Props = {
  class?: string
  image: string
  onClose: () => void
}

export const Lightbox = (props: Props) => {
  const [zoomLevel, setZoomLevel] = createSignal(1)

  const closeLightbox = () => {
    props.onClose()
  }

  const zoomIn = (event) => {
    event.stopPropagation()
    setZoomLevel(zoomLevel() * 1.08)
  }
  const zoomOut = (event) => {
    event.stopPropagation()
    setZoomLevel(zoomLevel() / 1.08)
  }

  const lightboxStyle = () => ({
    transform: `scale(${zoomLevel()})`,
    transition: 'transform 0.3s ease'
  })

  return (
    <div class={clsx(styles.Lightbox, props.class)} onClick={closeLightbox}>
      <span class={styles.close} onClick={closeLightbox}>
        <Icon name="close-white" />
      </span>
      <div class={styles.zoomControls}>
        <button class={styles.control} onClick={(event) => zoomOut(event)}>
          <b>-</b>
        </button>
        <button class={styles.control} onClick={(event) => zoomIn(event)}>
          <b>+</b>
        </button>
      </div>
      <img
        class={styles.image}
        src={props.image}
        style={lightboxStyle()}
        alt={''}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  )
}

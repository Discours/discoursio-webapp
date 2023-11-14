import { clsx } from 'clsx'
import styles from './Lightbox.module.scss'
import { createSignal } from 'solid-js'
import { Icon } from '../Icon'
import { useEscKeyDownHandler } from '../../../utils/useEscKeyDownHandler'

type Props = {
  class?: string
  image: string
  onClose: () => void
}

const ZOOM_STEP = 1.08
export const Lightbox = (props: Props) => {
  const [zoomLevel, setZoomLevel] = createSignal(1)

  const closeLightbox = () => {
    props.onClose()
  }

  const zoomIn = (event) => {
    event.stopPropagation()
    setZoomLevel(zoomLevel() * ZOOM_STEP)
  }
  const zoomOut = (event) => {
    event.stopPropagation()
    setZoomLevel(zoomLevel() / ZOOM_STEP)
  }

  const lightboxStyle = () => ({
    transform: `scale(${zoomLevel()})`,
    transition: 'transform 0.3s ease'
  })

  useEscKeyDownHandler(closeLightbox)

  return (
    <div class={clsx(styles.Lightbox, props.class)} onClick={closeLightbox}>
      <span class={styles.close} onClick={closeLightbox}>
        <Icon name="close-white" />
      </span>
      <div class={styles.zoomControls}>
        <button class={styles.control} onClick={(event) => zoomOut(event)}>
          <b>-</b>
        </button>
        <button class={styles.control} onClick={() => setZoomLevel(1)}>
          <b style={{ 'font-size': '10px' }}>1:1</b>
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

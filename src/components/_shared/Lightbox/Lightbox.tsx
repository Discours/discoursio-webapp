import { clsx } from 'clsx'
import styles from './Lightbox.module.scss'
import { createSignal } from 'solid-js'

type Props = {
  class?: string
  image: string
  isOpen: boolean
}

export const Lightbox = (props: Props) => {
  const [visible, setVisible] = createSignal(false)
  const [zoomLevel, setZoomLevel] = createSignal(1)

  setVisible(props.isOpen)
  const closeLightbox = () => setVisible(false)

  const zoomIn = () => setZoomLevel(zoomLevel() * 1.08)
  const zoomOut = () => setZoomLevel(zoomLevel() / 1.08)

  const lightboxStyle = () => ({
    transform: `scale(${zoomLevel()})`,
    transition: 'transform 0.3s ease'
  })

  return (
    <div class={clsx(styles.Lightbox, props.class)}>
      <div class="lightbox" style={{ display: visible() ? 'flex' : 'none' }} onClick={closeLightbox}>
        <span class="close" onClick={closeLightbox}>
          &times;
        </span>
        <div class="zoom-controls">
          <button onClick={zoomIn}>+</button>
          <button onClick={zoomOut}>-</button>
        </div>
        <img class="lightbox-image" src={props.image} alt="Fullscreen" style={lightboxStyle()} />
      </div>
    </div>
  )
}

import { clsx } from 'clsx'
import { createSignal } from 'solid-js'

import { Icon } from '../Icon'

import { useEscKeyDownHandler } from '../../../utils/useEscKeyDownHandler'

import styles from './Lightbox.module.scss'

type Props = {
  class?: string
  imageAlt?: string
  image: string
  onClose: () => void
}

const ZOOM_STEP = 1.08

export const Lightbox = (props: Props) => {
  const lightboxRef: {
    current: HTMLElement
  } = {
    current: null,
  }

  const [zoomLevel, setZoomLevel] = createSignal(1)

  const closeLightbox = () => {
    lightboxRef.current?.classList.add(styles.fadeOut)

    setTimeout(() => {
      props.onClose()
    }, 300)
  }

  const zoomIn = (event) => {
    event.stopPropagation()
    setZoomLevel(zoomLevel() * ZOOM_STEP)
  }

  const zoomOut = (event) => {
    event.stopPropagation()
    setZoomLevel(zoomLevel() / ZOOM_STEP)
  }

  const zoomReset = (event) => {
    event.stopPropagation()
    setZoomLevel(1)
  }

  const handleWheelZoom = (event) => {
    event.preventDefault()

    let scale = zoomLevel()

    scale += event.deltaY * -0.01

    scale = Math.min(Math.max(0.125, scale), 4)

    setZoomLevel(scale * ZOOM_STEP)
  }

  const lightboxStyle = () => ({
    transform: `scale(${zoomLevel()})`,
    transition: 'transform 0.3s ease',
  })

  useEscKeyDownHandler(closeLightbox)

  return (
    <div
      class={clsx(styles.Lightbox, props.class)}
      onClick={closeLightbox}
      ref={(el) => (lightboxRef.current = el)}
    >
      <span class={styles.close} onClick={closeLightbox}>
        <Icon name="close-white" class={styles.icon} />
      </span>
      <div class={styles.zoomControls}>
        <button class={styles.control} onClick={(event) => zoomOut(event)}>
          &minus;
        </button>
        <button class={clsx(styles.control, styles.controlDefault)} onClick={(event) => zoomReset(event)}>
          1:1
        </button>
        <button class={styles.control} onClick={(event) => zoomIn(event)}>
          +
        </button>
      </div>
      <img
        class={styles.image}
        src={props.image}
        style={lightboxStyle()}
        alt={props.imageAlt || ''}
        onClick={(event) => event.stopPropagation()}
        onWheel={handleWheelZoom}
      />
    </div>
  )
}

import { clsx } from 'clsx'
import { Show, createEffect, on, createMemo, createSignal, onCleanup } from 'solid-js'

import { getImageUrl } from '../../../utils/getImageUrl'
import { useEscKeyDownHandler } from '../../../utils/useEscKeyDownHandler'
import { Icon } from '../Icon'

import styles from './Lightbox.module.scss'

type Props = {
  class?: string
  imageAlt?: string
  image: string
  onClose: () => void
}

const ZOOM_STEP = 1.08
const TRANSITION_SPEED = 300

export const Lightbox = (props: Props) => {
  const [zoomLevel, setZoomLevel] = createSignal(1)
  const [pictureScalePercentage, setPictureScalePercentage] = createSignal<number | null>(null)
  const [translateX, setTranslateX] = createSignal(0)
  const [translateY, setTranslateY] = createSignal(0)
  const [transitionEnabled, setTransitionEnabled] = createSignal(false)

  const lightboxRef: {
    current: HTMLElement
  } = {
    current: null,
  }

  const closeLightbox = () => {
    lightboxRef.current?.classList.add(styles.fadeOut)

    setTimeout(() => {
      props.onClose()
    }, 200)
  }

  const zoomIn = (event) => {
    event.stopPropagation()
    setTransitionEnabled(true)
    setZoomLevel(zoomLevel() * ZOOM_STEP)
    setTimeout(() => setTransitionEnabled(false), TRANSITION_SPEED)
  }

  const zoomOut = (event) => {
    event.stopPropagation()
    setTransitionEnabled(true)
    setZoomLevel(zoomLevel() / ZOOM_STEP)
    setTimeout(() => setTransitionEnabled(false), TRANSITION_SPEED)
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

    setTransitionEnabled(true)
    setZoomLevel(scale * ZOOM_STEP)
  }

  useEscKeyDownHandler(closeLightbox)

  let startX: number = 0
  let startY: number = 0
  let isDragging: boolean = false

  const onMouseDown: (event: MouseEvent) => void = (event) => {
    startX = event.clientX - translateX()
    startY = event.clientY - translateY()
    isDragging = true
    event.preventDefault()
  }

  const onMouseMove: (event: MouseEvent) => void = (event) => {
    if (isDragging) {
      setTranslateX(event.clientX - startX)
      setTranslateY(event.clientY - startY)
    }
  }

  const onMouseUp: () => void = () => {
    isDragging = false
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)

  onCleanup(() => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  })

  const lightboxStyle = createMemo(() => ({
    transform: `translate(${translateX()}px, ${translateY()}px) scale(${zoomLevel()})`,
    transition: transitionEnabled() ? `transform ${TRANSITION_SPEED}ms ease-in-out` : '',
    cursor: 'grab',
  }))

  let fadeTimer

  createEffect(
    on(
      () => zoomLevel(),
      () => {
        clearTimeout(fadeTimer)

        fadeTimer = setTimeout(() => {
          setPictureScalePercentage(null)
        }, 2200)

        setPictureScalePercentage(Math.round(zoomLevel() * 100))
      },
      { defer: true },
    ),
  )

  createEffect(() => {
    console.log('!!! pictureScalePercentage:', pictureScalePercentage())
  })
  return (
    <div
      class={clsx(styles.Lightbox, props.class)}
      onClick={closeLightbox}
      ref={(el) => (lightboxRef.current = el)}
    >
      <Show when={pictureScalePercentage()}>
        <div class={styles.scalePercentage}>{`${pictureScalePercentage()}%`}</div>
      </Show>
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
        src={getImageUrl(props.image, { noSizeUrlPart: true })}
        alt={props.imageAlt || ''}
        onClick={(event) => event.stopPropagation()}
        onWheel={handleWheelZoom}
        style={lightboxStyle()}
        onMouseDown={onMouseDown}
      />
    </div>
  )
}

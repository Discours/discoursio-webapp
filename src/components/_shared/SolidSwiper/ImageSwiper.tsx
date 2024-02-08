import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal, on, onCleanup, onMount } from 'solid-js'
import SwiperCore from 'swiper'
import { Manipulation, Navigation, Pagination } from 'swiper/modules'
import { throttle } from 'throttle-debounce'

import { getImageUrl } from '../../../utils/getImageUrl'
import { MediaItem } from '../../../utils/types'
import { Icon } from '../Icon'
import { Image } from '../Image'
import { Lightbox } from '../Lightbox'

import { SwiperRef } from './swiper'

import styles from './Swiper.module.scss'

type Props = {
  images: MediaItem[]
  onImagesAdd?: (value: MediaItem[]) => void
  onImagesSorted?: (value: MediaItem[]) => void
  onImageDelete?: (mediaItemIndex: number) => void
  onImageChange?: (index: number, value: MediaItem) => void
}

const MIN_WIDTH = 540

export const ImageSwiper = (props: Props) => {
  const mainSwipeRef: { current: SwiperRef } = { current: null }
  const thumbSwipeRef: { current: SwiperRef } = { current: null }
  const swiperMainContainer: { current: HTMLDivElement } = { current: null }
  const [slideIndex, setSlideIndex] = createSignal(0)
  const [isMobileView, setIsMobileView] = createSignal(false)
  const [selectedImage, setSelectedImage] = createSignal('')

  const handleSlideChange = () => {
    thumbSwipeRef.current.swiper.slideTo(mainSwipeRef.current.swiper.activeIndex)
    setSlideIndex(mainSwipeRef.current.swiper.activeIndex)
  }

  createEffect(
    on(
      () => props.images.length,
      () => {
        mainSwipeRef.current?.swiper.update()
        thumbSwipeRef.current?.swiper.update()
      },
      { defer: true }
    )
  )

  onMount(async () => {
    const { register } = await import('swiper/element/bundle')
    register()
    SwiperCore.use([Pagination, Navigation, Manipulation])
    mainSwipeRef.current?.swiper?.on('slideChange', handleSlideChange)
  })

  onMount(() => {
    const updateDirection = () => {
      const width = window.innerWidth
      setIsMobileView(width < MIN_WIDTH)
    }

    updateDirection()

    const handleResize = throttle(100, () => {
      updateDirection()
    })

    window.addEventListener('resize', handleResize)

    onCleanup(() => {
      window.removeEventListener('resize', handleResize)
    })
  })

  const openLightbox = (image) => {
    setSelectedImage(image)
  }
  const handleLightboxClose = () => {
    setSelectedImage()
  }

  const handleImageClick = (event) => {
    const src = event.target.src

    openLightbox(getImageUrl(src))
  }

  return (
    <div class={clsx(styles.Swiper, styles.articleMode, { [styles.mobileView]: isMobileView() })}>
      <div class={styles.container} ref={(el) => (swiperMainContainer.current = el)}>
        <Show when={props.images.length > 0}>
          <div class={clsx(styles.holder, styles.thumbsHolder)}>
            <div class={styles.thumbs}>
              <swiper-container
                class={'thumbSwiper'}
                ref={(el) => (thumbSwipeRef.current = el)}
                slides-per-view={'auto'}
                space-between={isMobileView() ? 20 : 10}
                auto-scroll-offset={1}
                watch-overflow={true}
                watch-slides-visibility={true}
                direction={'horizontal'}
                slides-per-group-auto={true}
              >
                <For each={props.images}>
                  {(slide, index) => (
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    <swiper-slide virtual-index={index()} style={{ width: 'auto', height: 'auto' }}>
                      <div
                        class={clsx(styles.imageThumb)}
                        style={{
                          'background-image': `url(${getImageUrl(slide.url, { width: 110, height: 75 })})`
                        }}
                      />
                    </swiper-slide>
                  )}
                </For>
              </swiper-container>
              <div
                class={clsx(styles.navigation, styles.thumbsNav, styles.prev, {
                  [styles.disabled]: slideIndex() === 0
                })}
                onClick={() => thumbSwipeRef.current.swiper.slidePrev()}
              >
                <Icon name="swiper-l-arr" class={styles.icon} />
              </div>
              <div
                class={clsx(styles.navigation, styles.thumbsNav, styles.next, {
                  [styles.disabled]: slideIndex() + 1 === props.images.length
                })}
                onClick={() => thumbSwipeRef.current.swiper.slideNext()}
              >
                <Icon name="swiper-r-arr" class={styles.icon} />
              </div>
            </div>
          </div>
          <div class={styles.holder}>
            <swiper-container
              ref={(el) => (mainSwipeRef.current = el)}
              slides-per-view={1}
              thumbs-swiper={'.thumbSwiper'}
              observer={true}
              space-between={isMobileView() ? 20 : 10}
            >
              <For each={props.images}>
                {(slide, index) => (
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  <swiper-slide lazy="true" virtual-index={index()}>
                    <div class={styles.image} onClick={handleImageClick}>
                      <Image src={slide.url} alt={slide.title} width={800} />
                    </div>
                  </swiper-slide>
                )}
              </For>
            </swiper-container>
            <div
              class={clsx(styles.navigation, styles.prev, {
                [styles.disabled]: slideIndex() === 0
              })}
              onClick={() => mainSwipeRef.current.swiper.slidePrev()}
            >
              <Icon name="swiper-l-arr" class={styles.icon} />
            </div>
            <div
              class={clsx(styles.navigation, styles.next, {
                [styles.disabled]: slideIndex() + 1 === props.images.length
              })}
              onClick={() => mainSwipeRef.current.swiper.slideNext()}
            >
              <Icon name="swiper-r-arr" class={styles.icon} />
            </div>
            <div class={styles.counter}>
              {slideIndex() + 1} / {props.images.length}
            </div>
          </div>
        </Show>
      </div>
      <div class={styles.slideDescription}>
        <Show when={props.images[slideIndex()]?.title}>
          <div class={styles.articleTitle}>{props.images[slideIndex()].title}</div>
        </Show>
        <Show when={props.images[slideIndex()]?.source}>
          <div class={styles.source}>{props.images[slideIndex()].source}</div>
        </Show>
        <Show when={props.images[slideIndex()]?.body}>
          <div class={styles.body} innerHTML={props.images[slideIndex()].body} />
        </Show>
      </div>

      <Show when={selectedImage()}>
        <Lightbox image={selectedImage()} onClose={handleLightboxClose} />
      </Show>
    </div>
  )
}

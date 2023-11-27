import { createFileUploader } from '@solid-primitives/upload'
import { clsx } from 'clsx'
import { createEffect, createSignal, For, Show, on, onMount, lazy, onCleanup } from 'solid-js'
import SwiperCore, { Manipulation, Navigation, Pagination } from 'swiper'

import { useLocalize } from '../../../context/localize'
import { useSnackbar } from '../../../context/snackbar'
import { MediaItem, UploadedFile } from '../../../pages/types'
import { composeMediaItems } from '../../../utils/composeMediaItems'
import { getImageUrl } from '../../../utils/getImageUrl'
import { handleImageUpload } from '../../../utils/handleImageUpload'
import { validateFiles } from '../../../utils/validateFile'
import { DropArea } from '../DropArea'
import { Icon } from '../Icon'
import { Image } from '../Image'
import { Loading } from '../Loading'
import { Popover } from '../Popover'

import { SwiperRef } from './swiper'

import styles from './Swiper.module.scss'

const SimplifiedEditor = lazy(() => import('../../Editor/SimplifiedEditor'))

type Props = {
  images: MediaItem[]
  onImagesAdd?: (value: MediaItem[]) => void
  onImagesSorted?: (value: MediaItem[]) => void
  onImageDelete?: (mediaItemIndex: number) => void
  onImageChange?: (index: number, value: MediaItem) => void
}

export const ImageSwiper = (props: Props) => {
  const [slideIndex, setSlideIndex] = createSignal(0)
  const mainSwipeRef: { current: SwiperRef } = { current: null }
  const thumbSwipeRef: { current: SwiperRef } = { current: null }
  const swiperMainContainer: { current: HTMLDivElement } = { current: null }

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
      { defer: true },
    ),
  )

  onMount(async () => {
    const { register } = await import('swiper/element/bundle')
    register()
    SwiperCore.use([Pagination, Navigation, Manipulation, ResizeObserver])
  })

  const [windowWidth, setWindowWidth] = createSignal(null)
  const [isMobileView, setIsMobileView] = createSignal(false)
  onMount(() => {
    setWindowWidth(window.innerWidth)

    const resizeObserver = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      console.log('!!! rect.width:', rect)
      const direction = rect.width > 540 ? 'vertical' : 'horizontal'

      if (direction === 'horizontal') {
        setIsMobileView(true)
      } else {
        setIsMobileView(false)
      }

      thumbSwipeRef.current.swiper.changeDirection(direction)
    })

    resizeObserver.observe(swiperMainContainer.current)
    onCleanup(() => {
      resizeObserver.disconnect()
    })
  })

  return (
    <div class={clsx(styles.Swiper, styles.articleMode, { [styles.mobileView]: isMobileView() })}>
      <div class={styles.container} ref={(el) => (swiperMainContainer.current = el)}>
        <Show when={props.images.length > 0}>
          <div class={styles.holder}>
            <swiper-container
              ref={(el) => (mainSwipeRef.current = el)}
              slides-per-view={1}
              thumbs-swiper={'.thumbSwiper'}
              observer={true}
              onSlideChange={handleSlideChange}
              space-between={isMobileView() ? 20 : 10}
            >
              <For each={props.images}>
                {(slide, index) => (
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  <swiper-slide lazy="true" virtual-index={index()}>
                    <div class={styles.image}>
                      <Image src={slide.url} alt={slide.title} width={800} />
                    </div>
                  </swiper-slide>
                )}
              </For>
            </swiper-container>
            <div
              class={clsx(styles.navigation, styles.prev, {
                [styles.disabled]: slideIndex() === 0,
              })}
              onClick={() => mainSwipeRef.current.swiper.slidePrev()}
            >
              <Icon name="swiper-l-arr" class={styles.icon} />
            </div>
            <div
              class={clsx(styles.navigation, styles.next, {
                [styles.disabled]: slideIndex() + 1 === props.images.length,
              })}
              onClick={() => mainSwipeRef.current.swiper.slideNext()}
            >
              <Icon name="swiper-r-arr" class={styles.icon} />
            </div>
            <div class={styles.counter}>
              {slideIndex() + 1} / {props.images.length}
            </div>
          </div>
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
                direction={windowWidth() && windowWidth() < 760 ? 'vertical' : 'horizontal'}

                // slides-offset-after={props.editorMode && 160}
                // slides-offset-before={props.editorMode && 30}
              >
                <For each={props.images}>
                  {(slide, index) => (
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    <swiper-slide virtual-index={index()} style={{ width: 'auto', height: 'auto' }}>
                      <div
                        class={clsx(styles.imageThumb)}
                        style={{
                          'background-image': `url(${getImageUrl(slide.url, { width: 110, height: 75 })})`,
                        }}
                      />
                    </swiper-slide>
                  )}
                </For>
              </swiper-container>
              <div
                class={clsx(styles.navigation, styles.thumbsNav, styles.prev, {
                  [styles.disabled]: slideIndex() === 0,
                })}
                onClick={() => thumbSwipeRef.current.swiper.slidePrev()}
              >
                <Icon name="swiper-l-arr" class={styles.icon} />
              </div>
              <div
                class={clsx(styles.navigation, styles.thumbsNav, styles.next, {
                  [styles.disabled]: slideIndex() + 1 === props.images.length,
                })}
                onClick={() => thumbSwipeRef.current.swiper.slideNext()}
              >
                <Icon name="swiper-r-arr" class={styles.icon} />
              </div>
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
    </div>
  )
}

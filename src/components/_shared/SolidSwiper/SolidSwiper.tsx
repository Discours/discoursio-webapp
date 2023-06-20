import { createEffect, createSignal, For, JSX, Show } from 'solid-js'
import SwiperCore, { Navigation, Thumbs, Manipulation, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/solid'
import { Swiper as SwiperTypes } from 'swiper/types'
import { MediaItem } from '../../../pages/types'
import { Icon } from '../Icon'
import { Popover } from '../Popover'
import { useLocalize } from '../../../context/localize'
import 'swiper/scss'
import { clsx } from 'clsx'
import styles from './Swiper.module.scss'

type Props = {
  class?: string
  variant: 'uploadView'
  slides: MediaItem[]
  updatedSlides?: (value: MediaItem[]) => void
  slideIndex?: (value: number) => void
  withThumbs?: boolean
  children?: JSX.Element
}

SwiperCore.use([Pagination, Manipulation])

export const SolidSwiper = (props: Props) => {
  const { t } = useLocalize()
  const [mainSwiper, setMainSwiper] = createSignal<SwiperTypes>(null)
  const [thumbsSwiper, setThumbsSwiper] = createSignal<SwiperTypes>(null)
  const [slideIndex, setSlideIndex] = createSignal<number>(0)

  const handleSlideDelete = () => {
    const copy = props.slides
    copy.splice(slideIndex(), 1)
    props.updatedSlides(copy)
    mainSwiper().removeSlide(slideIndex())
    thumbsSwiper().removeSlide(slideIndex())
  }

  return (
    <div class={clsx(styles.Swiper, props.class)}>
      <div class={styles.holder}>
        <Show when={thumbsSwiper()}>
          <Swiper
            onBeforeInit={(s) => setMainSwiper(s)}
            thumbs={{ swiper: thumbsSwiper() }}
            modules={[Navigation, Thumbs]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ type: 'fraction' }}
            onSwiper={(s) => {
              props.slideIndex(s.realIndex)
              setSlideIndex(s.realIndex)
            }}
            onSlideChange={(s) => {
              setSlideIndex(s.realIndex)
              props.slideIndex(s.realIndex)
            }}
          >
            <For each={props.slides}>
              {(slide, index) => (
                <SwiperSlide virtualIndex={index()}>
                  <div class={styles.image}>
                    <img src={slide.url} alt={slide.title} />
                    <Show when={props.variant === 'uploadView'}>
                      <Popover content={t('Delete')}>
                        {(triggerRef: (el) => void) => (
                          <div ref={triggerRef} class={styles.delete} onClick={handleSlideDelete}>
                            <Icon class={styles.icon} name="delete-white" />
                          </div>
                        )}
                      </Popover>
                    </Show>
                  </div>
                </SwiperSlide>
              )}
            </For>
          </Swiper>
        </Show>

        <div
          class={clsx(styles.navigation, styles.prev, {
            [styles.disabled]: slideIndex() === 0
          })}
          onClick={() => mainSwiper()?.slidePrev()}
        >
          <Icon name="swiper-l-arr" class={styles.icon} />
        </div>
        <div
          class={clsx(styles.navigation, styles.next, {
            [styles.disabled]: slideIndex() + 1 === Number(props.slides.length)
          })}
          onClick={() => mainSwiper()?.slideNext()}
        >
          <Icon name="swiper-r-arr" class={styles.icon} />
        </div>
      </div>

      <Show when={props.children}>{props.children}</Show>

      <Show when={props.withThumbs}>
        <div class={styles.thumbs}>
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[Navigation, Thumbs]}
            spaceBetween={20}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
          >
            <For each={props.slides}>
              {(slide, idx) => (
                <SwiperSlide style={{ width: 'auto' }}>
                  <div
                    class={clsx(styles.imageThumb, { [styles.active]: idx() === slideIndex() })}
                    style={{ 'background-image': `url(${slide.url})` }}
                  >
                    <Show when={props.variant === 'uploadView'}>
                      <Popover content={t('Delete')}>
                        {(triggerRef: (el) => void) => (
                          <div ref={triggerRef} class={styles.delete} onClick={handleSlideDelete}>
                            <Icon class={styles.icon} name="delete-white" />
                          </div>
                        )}
                      </Popover>
                    </Show>
                  </div>
                </SwiperSlide>
              )}
            </For>
          </Swiper>
        </div>
      </Show>
    </div>
  )
}

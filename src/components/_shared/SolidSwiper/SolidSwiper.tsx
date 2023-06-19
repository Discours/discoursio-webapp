import { createSignal, For, onMount, Show } from 'solid-js'
import { Navigation, Thumbs, Controller } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/solid'
import { Swiper as SwiperCore } from 'swiper/types'
import { MediaItem } from '../../../pages/types'
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/scss/thumbs'

import styles from './Swiper.module.scss'
import { clsx } from 'clsx'
import { Icon } from '../Icon'

type Props = {
  class?: string
  slides: MediaItem[]
  slideIndex?: (value: number) => void
  withThumbs?: boolean
  variant?: 'uploadView'
}

export const SolidSwiper = (props: Props) => {
  const swiperRef: { current: SwiperCore } = { current: null }
  const thumbRef: { current: SwiperCore } = { current: null }
  const [slideIndex, setSlideIndex] = createSignal<number>(0)
  const [thumbsSwiper, setThumbsSwiper] = createSignal(null)

  return (
    <div class={clsx(styles.Swiper, props.class)}>
      <div class={styles.holder}>
        <Show when={thumbsSwiper()}>
          <Swiper
            onBeforeInit={(s) => {
              swiperRef.current = s
            }}
            thumbs={{ swiper: thumbsSwiper() }}
            modules={[Navigation, Thumbs]}
            spaceBetween={20}
            slidesPerView={1}
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
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <Icon name="swiper-l-arr" class={styles.icon} />
        </div>
        <div
          class={clsx(styles.navigation, styles.next, {
            [styles.disabled]: slideIndex() + 1 === Number(props.slides.length)
          })}
          onClick={() => swiperRef.current?.slideNext()}
        >
          <Icon name="swiper-r-arr" class={styles.icon} />
        </div>

        <div class={styles.counter}>
          <b>{slideIndex() + 1}</b>/<b>{props.slides.length}</b>
        </div>
      </div>

      <Show when={props.withThumbs}>
        <div class={styles.thumbs}>
          <Swiper
            onBeforeInit={(s) => {
              thumbRef.current = s
            }}
            onSwiper={setThumbsSwiper}
            modules={[Navigation, Thumbs]}
            spaceBetween={10}
            slidesPerView={3}
            freeMode={true}
            watchSlidesProgress={true}
          >
            <For each={props.slides}>
              {(slide, idx) => (
                <SwiperSlide>
                  <div
                    class={clsx(styles.imageThumb, { [styles.active]: idx() === slideIndex() })}
                    style={{ 'background-image': `url(${slide.url})` }}
                  >
                    {idx()}
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

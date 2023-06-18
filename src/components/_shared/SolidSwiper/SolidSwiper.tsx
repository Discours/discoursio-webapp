import { clsx } from 'clsx'
import { Swiper, SwiperSlide } from 'swiper/solid'
import 'swiper/css'
import styles from './Swiper.module.scss'
import { MediaItem } from '../../../pages/types'
import { For } from 'solid-js'

type Props = {
  class?: string
  slides: MediaItem[]
  slideIndex?: (value: number) => void
}

export const SolidSwiper = (props: Props) => {
  return (
    <div class="wide-container">
      <div class="row">
        <div class={clsx(styles.Swiper, props.class)}>
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            onSlideChange={(swiper) => props.slideIndex(swiper.realIndex)}
            onSwiper={(swiper) => props.slideIndex(swiper.realIndex)}
          >
            <For each={props.slides}>
              {(slide, index) => (
                <SwiperSlide virtualIndex={index()}>
                  <img src={slide.url} alt={slide.title} />
                </SwiperSlide>
              )}
            </For>
          </Swiper>
        </div>
      </div>
    </div>
  )
}

import { For, Show, createEffect, createSignal } from 'solid-js'
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/solid'

import type { Swiper as SwiperType } from 'swiper'
import type { SwiperOptions } from 'swiper'
import 'swiper/scss'
import 'swiper/scss/thumbs'
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import styles from './Slider.module.scss'
import { Icon } from '../Icon'
import { clsx } from 'clsx'
import type { MediaItem } from '../../Article/FullArticle'

type SliderProps = {
  title?: string
  slidesPerView?: number
  isCardsWithCover?: boolean
  childElements: MediaItem[]
  variant?: 'thumbGallery'
}

export default (props: SliderProps) => {
  let el: HTMLDivElement | undefined
  let thumbEl: HTMLDivElement | undefined
  let pagEl: HTMLDivElement | undefined
  let nextEl: HTMLDivElement | undefined
  let prevEl: HTMLDivElement | undefined
  let thumbChild: HTMLDivElement | undefined

  const isCardsWithCover = typeof props.isCardsWithCover === 'boolean' ? props.isCardsWithCover : true

  // const [swiper, setSwiper] = createSignal<SwiperType>()
  const [thumbs, setThumbs] = createSignal<SwiperType>()
  //
  // const thumbnails: SwiperOptions = {
  //   loop: true,
  //   spaceBetween: 1,
  //   slidesPerView: 4,
  //   freeMode: true,
  //   watchSlidesProgress: true,
  // };
  //
  // const opts: SwiperOptions = {
  //   roundLengths: true,
  //   loop: true,
  //   centeredSlides: true,
  //   slidesPerView: 1,
  //   // modules: [Navigation, Pagination, Thumbs],
  //   speed: 500,
  //   navigation: { nextEl, prevEl },
  //   pagination: {
  //     el: pagEl,
  //     type: 'bullets',
  //     clickable: true
  //   },
  //   thumbs: {
  //     swiper: thumbs(),
  //   }
  // breakpoints: {
  //   768: {
  //     slidesPerView: props.slidesPerView > 0 ? props.slidesPerView : 1.66666,
  //     spaceBetween: isCardsWithCover ? 8 : 26
  //   },
  //   992: {
  //     slidesPerView: props.slidesPerView > 0 ? props.slidesPerView : 1.66666,
  //     spaceBetween: isCardsWithCover ? 8 : 52
  //   }
  // }
  // }

  return (
    <div class={clsx('floor', 'floor--important')}>
      <div class={clsx('wide-container')}>
        <div class={clsx('row')}>
          <Show when={props.title}>
            <h2 class={clsx('col-12')}>{props.title}</h2>
          </Show>
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={50}
            slidesPerView={1}
            onSlideChange={() => console.log('slide change')}
            onSwiper={(swiper) => console.log(swiper)}
          >
            <For each={props.childElements}>
              {(m: MediaItem) => (
                <SwiperSlide>
                  <img src={m.url || m.pic} alt={m.title} />
                  {/*<div innerHTML={m.body} />*/}
                </SwiperSlide>
              )}
            </For>
          </Swiper>
        </div>
      </div>
    </div>
  )
}

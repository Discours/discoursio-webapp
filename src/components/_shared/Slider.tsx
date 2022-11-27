import { Swiper, Navigation, Pagination } from 'swiper'
import type { SwiperOptions } from 'swiper'
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import './Slider.scss'
import type { Shout } from '../../graphql/types.gen'
import { createEffect, createMemo, createSignal, Show, For, JSX } from 'solid-js'
import { Icon } from './Icon'

interface SliderProps {
  title?: string
  articles?: Shout[]
  slidesPerView?: number
  isCardsWithCover?: boolean
  children?: JSX.Element
}

export default (props: SliderProps) => {
  let el: HTMLDivElement | undefined
  let pagEl: HTMLDivElement | undefined
  let nextEl: HTMLDivElement | undefined
  let prevEl: HTMLDivElement | undefined

  const isCardsWithCover = typeof props.isCardsWithCover === 'boolean' ? props.isCardsWithCover : true

  const opts: SwiperOptions = {
    roundLengths: true,
    loop: true,
    centeredSlides: true,
    slidesPerView: 1,
    modules: [Navigation, Pagination],
    speed: 500,
    navigation: { nextEl, prevEl },
    pagination: {
      el: pagEl,
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      768: {
        slidesPerView: props.slidesPerView > 0 ? props.slidesPerView : 1.66666,
        spaceBetween: isCardsWithCover ? 8 : 26
      },
      992: {
        slidesPerView: props.slidesPerView > 0 ? props.slidesPerView : 1.66666,
        spaceBetween: isCardsWithCover ? 8 : 52
      }
    }
  }

  const [swiper, setSwiper] = createSignal<Swiper>()
  createEffect(() => {
    if (!swiper() && !!el) {
      setTimeout(() => {
        setSwiper(new Swiper(el, opts))
      }, 500)
    }
  })
  const articles = createMemo(() => props.articles)

  return (
    <div class="floor floor--important">
      <div class="wide-container">
        <div class="row">
          <h2 class="col-12">{props.title}</h2>
          <Show when={!!articles()}>
            <div class="swiper" classList={{ 'cards-with-cover': isCardsWithCover }} ref={el}>
              <div class="swiper-wrapper">{props.children}</div>
              <div class="slider-arrow-next" ref={nextEl} onClick={() => swiper()?.slideNext()}>
                <Icon name="slider-arrow" class={'icon'} />
              </div>
              <div class="slider-arrow-prev" ref={prevEl} onClick={() => swiper()?.slidePrev()}>
                <Icon name="slider-arrow" class={'icon'} />
              </div>
              <div class="slider-pagination" ref={pagEl} />
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

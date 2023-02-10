import { Swiper, Navigation, Pagination, Lazy, Thumbs } from 'swiper'
import type { SwiperOptions } from 'swiper'
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import 'swiper/scss/lazy'
import 'swiper/scss/thumbs'
import './Slider.scss'
import { createEffect, createSignal, JSX, Show } from 'solid-js'
import { Icon } from './Icon'
import { clsx } from 'clsx'

interface SliderProps {
  title?: string
  slidesPerView?: number
  isCardsWithCover?: boolean
  children?: JSX.Element
  class?: string
  isPageGallery?: boolean
  hasThumbs?: boolean
}

export default (props: SliderProps) => {
  let el: HTMLDivElement | undefined
  let thumbsEl: HTMLDivElement | undefined
  let pagEl: HTMLDivElement | undefined
  let nextEl: HTMLDivElement | undefined
  let prevEl: HTMLDivElement | undefined

  const isCardsWithCover = typeof props.isCardsWithCover === 'boolean' ? props.isCardsWithCover : true

  const [swiper, setSwiper] = createSignal<Swiper>()
  const [swiperThumbs, setSwiperThumbs] = createSignal<Swiper>()

  const opts: SwiperOptions = {
    lazy: true,
    roundLengths: true,
    loop: true,
    centeredSlides: true,
    slidesPerView: 1,
    modules: [Navigation, Pagination, Lazy, Thumbs],
    speed: 500,
    navigation: { nextEl, prevEl },
    breakpoints: {
      768: {
        slidesPerView: props.slidesPerView > 0 ? props.slidesPerView : 1.66666,
        spaceBetween: isCardsWithCover ? 8 : 26
      },
      992: {
        slidesPerView: props.slidesPerView > 0 ? props.slidesPerView : 1.66666,
        spaceBetween: isCardsWithCover ? 8 : 52
      }
    },
    thumbs: {
      swiper: swiperThumbs()
    }
  }

  createEffect(() => {
    if (props.hasThumbs && !!thumbsEl) {
      setTimeout(() => {
        setSwiperThumbs(
          new Swiper(thumbsEl, {
            slidesPerView: 'auto',
            modules: [Lazy, Thumbs],
            lazy: true,
            roundLengths: true,
            spaceBetween: 20,
            freeMode: true,
            breakpoints: {
              768: {
                direction: 'vertical'
              }
            }
          })
        )
      }, 500)
    }
  })

  createEffect(() => {
    if (!swiper() && !!el) {
      setTimeout(() => {
        if (swiperThumbs()) {
          opts.thumbs = {
            swiper: swiperThumbs()
          }

          opts.pagination = {
            el: '.swiper-pagination',
            type: 'fraction'
          }
        }

        setSwiper(new Swiper(el, opts))
      }, 500)
    }
  })

  return (
    <div class="floor floor--important">
      <div class="wide-container">
        <div class="row">
          <h2 class="col-12">{props.title}</h2>

          <div class="sliders-container">
            <div
              class={clsx('swiper', props.class)}
              classList={{
                'cards-with-cover': isCardsWithCover,
                'swiper--page-gallery': props.isPageGallery
              }}
              ref={el}
            >
              <div class="swiper-wrapper">{props.children}</div>
              <div class="slider-arrow-next" ref={nextEl} onClick={() => swiper()?.slideNext()}>
                <Icon name="slider-arrow" class={'icon'} />
              </div>
              <div class="slider-arrow-prev" ref={prevEl} onClick={() => swiper()?.slidePrev()}>
                <Icon name="slider-arrow" class={'icon'} />
              </div>
              <div class="swiper-pagination" ref={pagEl} />
            </div>

            <Show when={props.hasThumbs}>
              <div class="thumbs-container">
                <div class="swiper swiper--thumbs" ref={thumbsEl}>
                  <div class="swiper-wrapper">{props.children}</div>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}

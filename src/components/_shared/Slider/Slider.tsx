//TODO: Replace with SolidSwiper.tsx

import { Swiper, Navigation, Pagination, Thumbs } from 'swiper'
import type { SwiperOptions } from 'swiper'
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import 'swiper/scss/thumbs'
import './Slider.scss'
import { createEffect, createSignal, JSX, on, Show } from 'solid-js'
import { Icon } from '../Icon'
import { clsx } from 'clsx'

interface Props {
  title?: string
  slidesPerView?: number
  isCardsWithCover?: boolean
  children?: JSX.Element
  isPageGallery?: boolean
  hasThumbs?: boolean
  variant?: 'uploadPreview'
  slideIndex?: (value: number) => void
}

export const Slider = (props: Props) => {
  let el: HTMLDivElement | undefined
  let thumbsEl: HTMLDivElement | undefined
  let nextEl: HTMLDivElement | undefined
  let prevEl: HTMLDivElement | undefined

  const isCardsWithCover = typeof props.isCardsWithCover === 'boolean' ? props.isCardsWithCover : true

  const [swiper, setSwiper] = createSignal<Swiper>()
  const [swiperThumbs, setSwiperThumbs] = createSignal<Swiper>()
  const opts: SwiperOptions = {
    observer: true,
    observeParents: true,
    roundLengths: true,
    loop: true,
    centeredSlides: true,
    slidesPerView: 1,
    modules: [Navigation, Pagination, Thumbs],
    speed: 500,
    on: {
      slideChange: () => {
        if (swiper()) {
          props.slideIndex(swiper().realIndex || 0)
        }
      }
    },
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
      setSwiperThumbs(
        new Swiper(thumbsEl, {
          slidesPerView: 'auto',
          modules: [Thumbs],
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
    }
  })

  createEffect(() => {
    if (!swiper() && !!el) {
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
      swiper().update()
    }
  })

  createEffect(() => {
    swiper().update()
  })

  return (
    <div class={clsx('floor', 'floor--important', props.variant)}>
      <div class="wide-container">
        <div class="row">
          <Show when={props.title}>
            <h2 class="col-24">{props.title}</h2>
          </Show>

          <div class="sliders-container">
            <div
              class={clsx('swiper')}
              classList={{
                'cards-with-cover': isCardsWithCover,
                'swiper--page-gallery': props.isPageGallery
              }}
              ref={el}
            >
              <div class="swiper-wrapper">{props.children}</div>
              <Show when={!(props.variant === 'uploadPreview')}>
                <div class="slider-arrow-next" ref={nextEl} onClick={() => swiper()?.slideNext()}>
                  <Icon name="slider-arrow" class={'icon'} />
                </div>
                <div class="slider-arrow-prev" ref={prevEl} onClick={() => swiper()?.slidePrev()}>
                  <Icon name="slider-arrow" class={'icon'} />
                </div>
              </Show>
              {/*<div class="swiper-pagination" ref={pagEl} />*/}
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
      <Show when={props.variant === 'uploadPreview'}>
        <div class="slider-arrow-next" ref={nextEl} onClick={() => swiper()?.slideNext()}>
          <Icon name="slider-arrow" class={'icon'} />
        </div>
        <div class="slider-arrow-prev" ref={prevEl} onClick={() => swiper()?.slidePrev()}>
          <Icon name="slider-arrow" class={'icon'} />
        </div>
      </Show>
    </div>
  )
}

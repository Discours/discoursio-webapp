import { createSignal, For, Show } from 'solid-js'
import { Icon } from '../Icon'
import { register } from 'swiper/element/bundle'
import SwiperCore, { Manipulation, Navigation, Pagination } from 'swiper'
import { SwiperRef } from './swiper'
import { clsx } from 'clsx'
import styles from './Swiper.module.scss'
import { Shout } from '../../../graphql/types.gen'
import { ArticleCard } from '../../Feed/ArticleCard'

type Props = {
  slides: Shout[]
  slidesPerView?: number
  title?: string
}

register()

SwiperCore.use([Pagination, Navigation, Manipulation])

export const ArticleCardSwiper = (props: Props) => {
  const [slideIndex, setSlideIndex] = createSignal(0)

  const mainSwipeRef: { current: SwiperRef } = { current: null }

  const handleSlideChange = () => {
    setSlideIndex(mainSwipeRef.current.swiper.activeIndex)
  }

  return (
    <div class={clsx(styles.Swiper, styles.articleMode, styles.ArticleCardSwiper)}>
      <Show when={props.title}>
        <h2 class={styles.sliderTitle}>{props.title}</h2>
      </Show>
      <div class={styles.container}>
        <Show when={props.slides.length > 0}>
          <div class={styles.holder}>
            <swiper-container
              ref={(el) => (mainSwipeRef.current = el)}
              centered-slides={true}
              thumbs-swiper={'.thumbSwiper'}
              observer={true}
              onSlideChange={handleSlideChange}
              slides-per-view={1}
              space-between={26}
              breakpoints={{
                576: { slidesPerView: props.slidesPerView ?? 1.5 },
                992: { spaceBetween: 52 }
              }}
              loop={true}
              speed={800}
              autoplay={{
                disableOnInteraction: false,
                delay: 3000,
                pauseOnMouseEnter: true
              }}
            >
              <For each={props.slides}>
                {(slide, index) => (
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  <swiper-slide virtual-index={index()}>
                    <ArticleCard
                      article={slide}
                      settings={{
                        additionalClass: 'swiper-slide',
                        isFloorImportant: true,
                        isWithCover: true,
                        nodate: true
                      }}
                    />
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
                [styles.disabled]: slideIndex() + 1 === props.slides.length
              })}
              onClick={() => mainSwipeRef.current.swiper.slideNext()}
            >
              <Icon name="swiper-r-arr" class={styles.icon} />
            </div>
            <div class={styles.counter}>
              {slideIndex() + 1} / {props.slides.length}
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}

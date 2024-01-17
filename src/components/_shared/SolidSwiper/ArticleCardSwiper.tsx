import { clsx } from 'clsx'
import { For, onMount, Show } from 'solid-js'
import SwiperCore from 'swiper'
import { Manipulation, Navigation, Pagination } from 'swiper/modules'

import { Shout } from '../../../graphql/schema/core.gen'
import { ArticleCard } from '../../Feed/ArticleCard'
import { Icon } from '../Icon'
import { ShowOnlyOnClient } from '../ShowOnlyOnClient'

import { SwiperRef } from './swiper'

import styles from './Swiper.module.scss'

type Props = {
  slides: Shout[]
  title?: string
}

export const ArticleCardSwiper = (props: Props) => {
  const mainSwipeRef: { current: SwiperRef } = { current: null }

  onMount(async () => {
    const { register } = await import('swiper/element/bundle')
    register()
    SwiperCore.use([Pagination, Navigation, Manipulation])
  })

  return (
    <ShowOnlyOnClient>
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
                observer={true}
                space-between={10}
                breakpoints={{
                  576: { spaceBetween: 20, slidesPerView: 1.5 },
                  992: { spaceBetween: 52, slidesPerView: 1.5 },
                }}
                round-lengths={true}
                loop={true}
                speed={800}
                autoplay={{
                  disableOnInteraction: false,
                  delay: 6000,
                  pauseOnMouseEnter: true,
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
                          nodate: true,
                        }}
                        desktopCoverSize="L"
                      />
                    </swiper-slide>
                  )}
                </For>
              </swiper-container>
              <div
                class={clsx(styles.navigation, styles.prev)}
                onClick={() => mainSwipeRef.current.swiper.slidePrev()}
              >
                <Icon name="swiper-l-arr" class={styles.icon} />
              </div>
              <div
                class={clsx(styles.navigation, styles.next)}
                onClick={() => mainSwipeRef.current.swiper.slideNext()}
              >
                <Icon name="swiper-r-arr" class={styles.icon} />
              </div>
            </div>
          </Show>
        </div>
      </div>
    </ShowOnlyOnClient>
  )
}

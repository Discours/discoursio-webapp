import { createEffect, createSignal, For, JSX, onMount, Show } from 'solid-js'
import { MediaItem } from '../../../pages/types'
import { Icon } from '../Icon'
import { Popover } from '../Popover'
import { useLocalize } from '../../../context/localize'
import 'swiper/scss'
import { clsx } from 'clsx'
import styles from './Swiper.module.scss'
import KeenSlider, { KeenSliderInstance } from 'keen-slider'
import { Mutation, Thumbnail } from './plugins'
import 'keen-slider/keen-slider.scss'

type Props = {
  class?: string
  variant: 'uploadView'
  slides: MediaItem[]
  slideIndex?: (value: number) => void
  children?: JSX.Element
  // addSlides?: (value: boolean) => void
  updatedSlides?: (value: MediaItem[]) => void
}

export const SolidSwiper = (props: Props) => {
  const { t } = useLocalize()
  const [slides, setSlides] = createSignal<MediaItem[]>(props.slides)

  const [mainSwiper, setMainSwiper] = createSignal<KeenSliderInstance>(null)
  const [thumbSwiper, setThumbSwiper] = createSignal<KeenSliderInstance>(null)

  const [slideIndex, setSlideIndex] = createSignal<number>(0)

  // createEffect(() => {
  //   props.slideIndex(slideIndex())
  // })

  // createEffect(() => {
  //   if (slides() !== props.slides) {
  //     console.log('!!! SW PROPS:', props.slides)
  //     console.log('!!! SW OLD:', slides())
  //     setSlides(props.slides)
  //     mainSwiper().updateSlides()
  //     thumbsSwiper().updateSlides()
  //   }
  // })

  onMount(() => {
    const slider = new KeenSlider(
      '#slider',
      {
        initial: 0,
        created: (s) => {
          console.log('!!! created:', s)
        },
        slideChanged(s) {
          setSlideIndex(s.track.details.rel)
          props.slideIndex(s.track.details.rel)
        }
      },
      [Mutation]
    )
    setMainSwiper(slider)

    const thumbnails = new KeenSlider(
      '#thumbnails',
      {
        initial: 0,
        slides: {
          perView: 4,
          spacing: 10
        }
      },
      [Thumbnail(slider)]
    )
    setThumbSwiper(thumbnails)
  })

  const handleSlideDelete = (e: Event, index: number) => {
    e.preventDefault()
    const copy = slides()
    props.updatedSlides(copy.splice(index, 1))
    setSlides([...slides().slice(0, index), ...slides().slice(-index)])
  }
  return (
    <div class={clsx(styles.Swiper, props.class)}>
      <div class={styles.holder}>
        <p>
          {slideIndex() + 1} / {slides().length}
        </p>
        <div id="slider" class="keen-slider">
          <For each={slides()}>
            {(slide, index) => (
              <div class={clsx(styles.image, 'keen-slider__slide')} data-key={index()}>
                <img src={slide.url} alt={slide.title} />
                <Show when={props.variant === 'uploadView'}>
                  <Popover content={t('Delete')}>
                    {(triggerRef: (el) => void) => (
                      <div
                        ref={triggerRef}
                        class={styles.delete}
                        onClick={(e) => handleSlideDelete(e, index())}
                      >
                        <Icon class={styles.icon} name="delete-white" />
                      </div>
                    )}
                  </Popover>
                </Show>
              </div>
            )}
          </For>
        </div>

        <div
          class={clsx(styles.navigation, styles.prev, {
            [styles.disabled]: slideIndex() === 0
          })}
          onClick={() => mainSwiper()?.prev()}
        >
          <Icon name="swiper-l-arr" class={styles.icon} />
        </div>
        <div
          class={clsx(styles.navigation, styles.next, {
            [styles.disabled]: slideIndex() + 1 === Number(props.slides.length)
          })}
          onClick={() => mainSwiper()?.next()}
        >
          <Icon name="swiper-r-arr" class={styles.icon} />
        </div>
      </div>

      <Show when={props.children}>{props.children}</Show>

      <div class={styles.holder}>
        <div class={styles.thumbs}>
          <div id="thumbnails" class="keen-slider thumbnail">
            <For each={slides()}>
              {(slide, index) => (
                <div class={clsx('keen-slider__slide')}>
                  <div
                    class={clsx(styles.imageThumb, { [styles.active]: index() === slideIndex() })}
                    style={{ 'background-image': `url(${slide.url})` }}
                  >
                    <Show when={props.variant === 'uploadView'}>
                      <Popover content={t('Delete')}>
                        {(triggerRef: (el) => void) => (
                          <div
                            ref={triggerRef}
                            class={styles.delete}
                            onClick={(e) => handleSlideDelete(e, index())}
                          >
                            <Icon class={styles.icon} name="delete-white" />
                          </div>
                        )}
                      </Popover>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
        {/*    <div*/}
        {/*      class={clsx(styles.navigation, styles.prev, {*/}
        {/*        [styles.disabled]: slideIndex() === 0*/}
        {/*      })}*/}
        {/*      onClick={() => thumbsSwiper()?.slidePrev()}*/}
        {/*    >*/}
        {/*      <Icon name="swiper-l-arr" class={styles.icon} />*/}
        {/*    </div>*/}
        {/*    <div*/}
        {/*      class={clsx(styles.navigation, styles.next, {*/}
        {/*        [styles.disabled]: slideIndex() + 1 === Number(props.slides.length)*/}
        {/*      })}*/}
        {/*      onClick={() => thumbsSwiper()?.slideNext()}*/}
        {/*    >*/}
        {/*      <Icon name="swiper-r-arr" class={styles.icon} />*/}
        {/*    </div>*/}
        {/*  </div>*/}
      </div>
    </div>
  )
}

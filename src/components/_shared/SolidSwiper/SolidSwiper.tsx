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
import { Button } from '../Button'

type Props = {
  class?: string
  variant: 'uploadView'
  slides: MediaItem[]

  slideIndex?: (value: number) => void
  children?: JSX.Element
  addSlides?: (value: boolean) => void
  deletedSlide?: (value: number) => void
}

export const SolidSwiper = (props: Props) => {
  const { t } = useLocalize()
  const [slides, setSlides] = createSignal<MediaItem[]>(props.slides)

  const [mainSwiper, setMainSwiper] = createSignal<KeenSliderInstance>(null)
  const [thumbSwiper, setThumbSwiper] = createSignal<KeenSliderInstance>(null)

  const [slideIndex, setSlideIndex] = createSignal<number>(0)

  onMount(() => {
    const slider = new KeenSlider(
      '#slider',
      {
        initial: 0,
        slides: {
          perView: 1
        },
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
          perView: 6,
          spacing: 20
        }
      },
      [Thumbnail(slider)]
    )
    setThumbSwiper(thumbnails)
  })

  createEffect(() => {
    setSlides(props.slides)
  })

  return (
    <div class={clsx(styles.Swiper, props.class)}>
      <div class={styles.holder}>
        <div class={styles.counter}>
          {slideIndex() + 1} / {slides().length}
        </div>
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
                        onClick={() => props.deletedSlide(index())}
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
                            onClick={() => props.deletedSlide(index())}
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
        <div
          class={clsx(styles.navigation, styles.prev, {
            [styles.disabled]: slideIndex() === 0
          })}
          onClick={() => thumbSwiper()?.prev()}
        >
          <Icon name="swiper-l-arr" class={styles.icon} />
        </div>
        <div
          class={clsx(styles.navigation, styles.next, {
            [styles.disabled]: slideIndex() + 1 === Number(props.slides.length)
          })}
          onClick={() => thumbSwiper()?.next()}
        >
          <Icon name="swiper-r-arr" class={styles.icon} />
        </div>
      </div>
      <Button value={t('Add images')} onClick={() => props.addSlides(true)} />
    </div>
  )
}

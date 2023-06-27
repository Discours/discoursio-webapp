import { createEffect, createSignal, For, JSX, onMount, Show } from 'solid-js'
import { MediaItem } from '../../../pages/types'
import { Icon } from '../Icon'
import { Popover } from '../Popover'
import { useLocalize } from '../../../context/localize'
import { register } from 'swiper/element/bundle'
import { clsx } from 'clsx'
import styles from './Swiper.module.scss'
import { DropArea } from '../DropArea'
import SwiperCore, { Manipulation, Navigation, Pagination, Swiper, SwiperOptions, Thumbs } from 'swiper'
import { SwiperContainer } from 'swiper/element/swiper-element'

type Props = {
  images: MediaItem[]
  editorMode?: boolean
  onImagesAdd: (value: MediaItem[]) => void
  onImageDelete: (mediaItemIndex: number) => void
  onImageChange: (index: number, value: MediaItem) => void
}

// const mock = [
//   'http://cdn.discours.io/4e09b3e5-aeac-4f0e-9249-be7ef9067f52.png',
//   'http://cdn.discours.io/8abdfe6b-eef7-4126-974f-26a89e1674aa.png',
//   'http://cdn.discours.io/0ca27f02-9f3d-4a4f-b26b-5eaaf517e582.png',
//   'http://cdn.discours.io/77f24b9b-bde7-470d-bdd9-278b40f5b207.jpeg',
//   'http://cdn.discours.io/25bf14aa-d415-4ae1-b7c4-9bd732ad2af7.jpeg',
//   'http://cdn.discours.io/0be24718-513b-49b3-ad23-804a18b84850.jpeg'
// ]

const composeMediaItem = (value) => {
  return value.map((url) => {
    return {
      url: url,
      source: '',
      title: '',
      body: ''
    }
  })
}

register()
SwiperCore.use([Pagination, Navigation, Manipulation])

export const SolidSwiper = (props: Props) => {
  const { t } = useLocalize()
  const dropAreaRef: { current: HTMLElement } = { current: null }
  const [mainSwiperEl, setMainSwiperEl] = createSignal<SwiperContainer>(null)
  const [thumbSwiperEl, setThumbSwiperEl] = createSignal(null)

  const mainSwiperParams: SwiperOptions = {
    slidesPerView: 1,
    pagination: {
      type: 'fraction'
    },
    thumbs: {
      swiper: thumbSwiperEl()
    },
    on: {
      init() {
        console.log('!!! init:')
      }
    }
  }

  const thumbsSwiperParams: SwiperOptions = {
    slidesPerView: 'auto',
    spaceBetween: 20,
    on: {
      init() {
        console.log('!!! initThumbs:')
      }
    }
  }

  onMount(() => {
    const mainSwiper: SwiperContainer = document.querySelector('#mainSwiper')
    const thumbSwiper: SwiperContainer = document.querySelector('#thumbSwiper')
    setMainSwiperEl(mainSwiper)
    setThumbSwiperEl(thumbSwiper)
    if (mainSwiperEl) {
      Object.assign(mainSwiper, mainSwiperParams)
      mainSwiper.initialize()
    }
    if (thumbSwiper) {
      Object.assign(thumbSwiper, thumbsSwiperParams)
      thumbSwiper.initialize()
    }
  })

  return (
    <div class={styles.Swiper}>
      <Show when={props.editorMode}>
        <DropArea
          ref={(el) => (dropAreaRef.current = el)}
          fileType="image"
          isMultiply={true}
          placeholder={t('Add images')}
          data={(value) => props.onImagesAdd(composeMediaItem(value))}
          description={
            <div>
              {t('You can upload up to 100 images in .jpg, .png format.')}
              <br />
              {t('Each image must be no larger than 5 MB.')}
            </div>
          }
        />
      </Show>

      <div class={styles.holder}>
        <swiper-container init="false" id="mainSwiper" pagination={{ type: 'fraction' }}>
          <For each={props.images}>
            {(slide, index) => (
              <swiper-slide virtual-index={index()}>
                <div class={styles.image}>
                  <img src={slide.url} alt={slide.title} />
                  <Show when={props.editorMode}>
                    <Popover content={t('Delete')}>
                      {(triggerRef: (el) => void) => (
                        <div
                          ref={triggerRef}
                          onClick={() => props.onImageDelete(index())}
                          class={styles.delete}
                        >
                          <Icon class={styles.icon} name="delete-white" />
                        </div>
                      )}
                    </Popover>
                  </Show>
                </div>
              </swiper-slide>
            )}
          </For>
        </swiper-container>
        <div
          class={clsx(styles.navigation, styles.prev, {
            // [styles.disabled]: slideIndex() === 0
          })}
          onClick={() => mainSwiperEl().swiper.slidePrev()}
        >
          <Icon name="swiper-l-arr" class={styles.icon} />
        </div>
        <div
          class={clsx(styles.navigation, styles.next, {
            // [styles.disabled]: slideIndex() + 1 === Number(props.slides.length)
          })}
          onClick={() => mainSwiperEl().swiper.slideNext()}
        >
          <Icon name="swiper-r-arr" class={styles.icon} />
        </div>
      </div>

      <div class={styles.holder}>
        <div class={styles.thumbs}>
          <swiper-container id="thumbSwiper" init="false">
            <For each={props.images}>
              {(slide, index) => (
                <swiper-slide virtual-index={index()} style={{ width: 'auto' }}>
                  <div
                    class={clsx(styles.imageThumb, { [styles.active]: index() === 0 })}
                    style={{ 'background-image': `url(${slide.url})` }}
                  >
                    <Show when={props.editorMode}>
                      <Popover content={t('Delete')}>
                        {(triggerRef: (el) => void) => (
                          <div
                            ref={triggerRef}
                            class={styles.delete}
                            onClick={() => props.onImageDelete(index())}
                          >
                            <Icon class={styles.icon} name="delete-white" />
                          </div>
                        )}
                      </Popover>
                    </Show>
                  </div>
                </swiper-slide>
              )}
            </For>
          </swiper-container>
        </div>
      </div>
    </div>
  )
}

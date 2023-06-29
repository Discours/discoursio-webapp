import { createEffect, createSignal, For, Match, onMount, Show, Switch, on } from 'solid-js'
import { MediaItem } from '../../../pages/types'
import { Icon } from '../Icon'
import { Popover } from '../Popover'
import { useLocalize } from '../../../context/localize'
import { register } from 'swiper/element/bundle'
import { DropArea } from '../DropArea'
import SwiperCore, { Manipulation, Navigation, Pagination } from 'swiper'
import { SwiperContainer } from 'swiper/element/swiper-element'
import { GrowingTextarea } from '../GrowingTextarea'
import { clsx } from 'clsx'
import styles from './Swiper.module.scss'
import MD from '../../Article/MD'
import { SwiperRef } from './swiper'

type Props = {
  images: MediaItem[]
  editorMode?: boolean
  onImagesAdd?: (value: MediaItem[]) => void
  onImageDelete?: (mediaItemIndex: number) => void
  onImageChange?: (index: number, value: MediaItem) => void
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
  const mainSwipeRef: { current: SwiperRef } = { current: null }
  const thumbSwipeRef: { current: SwiperRef } = { current: null }
  const handleSlideDescriptionChange = (index: number, field: string, value) => {
    props.onImageChange(index, { ...props.images[index], [field]: value })
  }

  const slideChangeTransitionStart = () => {
    console.log('!!! mainSwipeRef.current.swiper.activeIndex:', mainSwipeRef.current.swiper.activeIndex)
    thumbSwipeRef.current.swiper.slideTo(mainSwipeRef.current.swiper.activeIndex)
  }

  createEffect(
    on(
      () => props.images.length,
      () => {
        mainSwipeRef.current.swiper.update()
        thumbSwipeRef.current.swiper.update()
      }
    )
  )

  const handleUpload = (value: string[]) => {
    props.onImagesAdd(composeMediaItem(value))
    setTimeout(() => {
      mainSwipeRef.current.swiper.slideTo(props.images.length - 1)
    }, 0)
  }

  const handleDelete = (index: number) => {
    props.onImageDelete(index)

    if (index === 0) {
      mainSwipeRef.current.swiper.update()
    } else {
      mainSwipeRef.current.swiper.slideTo(index - 1)
    }
  }

  return (
    <div class={clsx(styles.Swiper, props.editorMode ? styles.editorMode : styles.articleMode)}>
      <div class={styles.container}>
        <Show when={props.editorMode}>
          <DropArea
            ref={(el) => (dropAreaRef.current = el)}
            fileType="image"
            isMultiply={true}
            placeholder={t('Add images')}
            onUpload={handleUpload}
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
          <swiper-container
            ref={(el) => (mainSwipeRef.current = el)}
            slides-per-view={1}
            thumbs-swiper={'.thumbSwiper'}
            observer={true}
            onSlideChange={slideChangeTransitionStart}
          >
            <div class="swiper-pagination" />
            <For each={props.images}>
              {(slide, index) => (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                <swiper-slide virtual-index={index()}>
                  <div class={styles.image}>
                    <img src={slide.url} alt={slide.title} />
                    <Show when={props.editorMode}>
                      <Popover content={t('Delete')}>
                        {(triggerRef: (el) => void) => (
                          <div ref={triggerRef} onClick={() => handleDelete(index())} class={styles.delete}>
                            <Icon class={styles.icon} name="delete-white" />
                          </div>
                        )}
                      </Popover>
                    </Show>
                  </div>
                  <Switch>
                    <Match when={props.editorMode}>
                      <div class={styles.description}>
                        <input
                          type="text"
                          class={clsx(styles.input, styles.title)}
                          placeholder={t('Enter image title')}
                          value={slide.title}
                          onChange={(event) =>
                            handleSlideDescriptionChange(index(), 'title', event.target.value)
                          }
                        />
                        <input
                          type="text"
                          class={styles.input}
                          placeholder={t('Specify the source and the name of the author')}
                          value={slide.source}
                          onChange={(event) =>
                            handleSlideDescriptionChange(index(), 'source', event.target.value)
                          }
                        />
                        <GrowingTextarea
                          class={styles.descriptionText}
                          placeholder={t('Enter image description')}
                          initialValue={slide.body}
                          value={(value) => handleSlideDescriptionChange(index(), 'body', value)}
                        />
                      </div>
                    </Match>
                    <Match when={!props.editorMode}>
                      <Show when={slide?.title}>
                        <p>
                          <small>{slide.title}</small>
                        </p>
                      </Show>
                      <Show when={slide?.source}>
                        <p>
                          <small>{slide.source}</small>
                        </p>
                      </Show>
                      <Show when={slide?.body}>
                        <MD body={slide.body} />
                      </Show>
                    </Match>
                  </Switch>
                </swiper-slide>
              )}
            </For>
          </swiper-container>
          <div
            class={clsx(styles.navigation, styles.prev, {
              // [styles.disabled]: slideIndex() === 0
            })}
            onClick={() => mainSwipeRef.current.swiper.slidePrev()}
          >
            <Icon name="swiper-l-arr" class={styles.icon} />
          </div>
          <div
            class={clsx(styles.navigation, styles.next, {
              // [styles.disabled]: slideIndex() + 1 === Number(props.slides.length)
            })}
            onClick={() => mainSwipeRef.current.swiper.slideNext()}
          >
            <Icon name="swiper-r-arr" class={styles.icon} />
          </div>
        </div>

        <div class={styles.thumbs}>
          <swiper-container
            class={'thumbSwiper'}
            ref={(el) => (thumbSwipeRef.current = el)}
            slides-per-view={'auto'}
            observer={true}
            space-between={props.editorMode ? 20 : 10}
            centered-slides={true}
            center-insufficient-slides={true}
            centered-slides-bounds={true}
            watch-overflow={true}
            watch-slides-visibility={true}
            watch-slides-progress={true}
            direction={props.editorMode ? 'horizontal' : 'vertical'}
          >
            <For each={props.images}>
              {(slide, index) => (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                <swiper-slide virtual-index={index()} style={{ width: 'auto', height: 'auto' }}>
                  <div class={clsx(styles.imageThumb)} style={{ 'background-image': `url(${slide.url})` }}>
                    <Show when={props.editorMode}>
                      <Popover content={t('Delete')}>
                        {(triggerRef: (el) => void) => (
                          <div ref={triggerRef} class={styles.delete} onClick={() => handleDelete(index())}>
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

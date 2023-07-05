import { createEffect, createSignal, For, Match, Show, Switch, on } from 'solid-js'
import { MediaItem } from '../../../pages/types'
import { Icon } from '../Icon'
import { Popover } from '../Popover'
import { useLocalize } from '../../../context/localize'
import { register } from 'swiper/element/bundle'
import { DropArea } from '../DropArea'
import { GrowingTextarea } from '../GrowingTextarea'
import MD from '../../Article/MD'
import { createFileUploader } from '@solid-primitives/upload'
import SwiperCore, { Manipulation, Navigation, Pagination } from 'swiper'
import { SwiperRef } from './swiper'
import { validateFiles } from '../../../utils/validateFile'
import { handleFileUpload } from '../../../utils/handleFileUpload'
import { useSnackbar } from '../../../context/snackbar'
import { Loading } from '../Loading'
import { imageProxy } from '../../../utils/imageProxy'
import { clsx } from 'clsx'
import styles from './Swiper.module.scss'
import { mediaItemsFromStringArray } from '../../../utils/mediaItemsFromStringArray'

type Props = {
  images: MediaItem[]
  editorMode?: boolean
  onImagesAdd?: (value: MediaItem[]) => void
  onImagesSorted?: (value: MediaItem[]) => void
  onImageDelete?: (mediaItemIndex: number) => void
  onImageChange?: (index: number, value: MediaItem) => void
}

register()

SwiperCore.use([Pagination, Navigation, Manipulation])

export const SolidSwiper = (props: Props) => {
  const { t } = useLocalize()
  const [loading, setLoading] = createSignal(false)
  const [slideIndex, setSlideIndex] = createSignal(0)

  const dropAreaRef: { current: HTMLElement } = { current: null }
  const mainSwipeRef: { current: SwiperRef } = { current: null }
  const thumbSwipeRef: { current: SwiperRef } = { current: null }

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const handleSlideDescriptionChange = (index: number, field: string, value) => {
    props.onImageChange(index, { ...props.images[index], [field]: value })
  }
  const swipeToUploaded = () => {
    setTimeout(() => {
      mainSwipeRef.current.swiper.slideTo(props.images.length - 1)
    }, 0)
  }
  const handleSlideChange = () => {
    thumbSwipeRef.current.swiper.slideTo(mainSwipeRef.current.swiper.activeIndex)
    setSlideIndex(mainSwipeRef.current.swiper.activeIndex)
  }

  createEffect(
    on(
      () => props.images.length,
      () => {
        mainSwipeRef.current?.swiper.update()
        thumbSwipeRef.current?.swiper.update()
      }
    )
  )

  const handleDropAreaUpload = (value: string[]) => {
    props.onImagesAdd(mediaItemsFromStringArray(value))
    swipeToUploaded()
  }

  const handleDelete = (index: number) => {
    props.onImageDelete(index)

    if (index === 0) {
      mainSwipeRef.current.swiper.update()
    } else {
      mainSwipeRef.current.swiper.slideTo(index - 1)
    }
  }

  const { selectFiles } = createFileUploader({
    multiple: true,
    accept: `image/*`
  })

  const initUpload = async (selectedFiles) => {
    const isValid = validateFiles('image', selectedFiles)
    if (isValid) {
      try {
        setLoading(true)
        const results: string[] = []
        for (const file of selectedFiles) {
          const result = await handleFileUpload(file)
          results.push(result)
        }
        props.onImagesAdd(mediaItemsFromStringArray(results))
        setLoading(false)
        swipeToUploaded()
      } catch (error) {
        await showSnackbar({ type: 'error', body: t('Error') })
        console.error('[runUpload]', error)
      }
    } else {
      await showSnackbar({ type: 'error', body: t('Invalid file type') })
      return false
    }
  }
  const handleUploadThumb = async () => {
    selectFiles((selectedFiles) => {
      initUpload(selectedFiles)
    })
  }

  const handleChangeIndex = (direction: 'left' | 'right', index: number) => {
    const images = [...props.images]
    if (direction === 'left' && index > 0) {
      const copy = images.splice(index, 1)[0]
      images.splice(index - 1, 0, copy)
    } else if (direction === 'right' && index < images.length - 1) {
      const copy = images.splice(index, 1)[0]
      images.splice(index + 1, 0, copy)
    }
    props.onImagesSorted(images)
    setTimeout(() => {
      mainSwipeRef.current.swiper.slideTo(direction === 'left' ? index - 1 : index + 1)
    }, 0)
  }

  return (
    <div class={clsx(styles.Swiper, props.editorMode ? styles.editorMode : styles.articleMode)}>
      <div class={styles.container}>
        <Show when={props.editorMode && props.images.length === 0}>
          <DropArea
            ref={(el) => (dropAreaRef.current = el)}
            fileType="image"
            isMultiply={true}
            placeholder={t('Add images')}
            onUpload={handleDropAreaUpload}
            description={
              <div>
                {t('You can upload up to 100 images in .jpg, .png format.')}
                <br />
                {t('Each image must be no larger than 5 MB.')}
              </div>
            }
          />
        </Show>
        <Show when={props.images.length > 0}>
          <div class={styles.holder}>
            <swiper-container
              ref={(el) => (mainSwipeRef.current = el)}
              slides-per-view={1}
              thumbs-swiper={'.thumbSwiper'}
              observer={true}
              onSlideChange={handleSlideChange}
            >
              <For each={props.images}>
                {(slide, index) => (
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  <swiper-slide lazy="true" virtual-index={index()}>
                    <div class={styles.image}>
                      <img src={imageProxy(slide.url)} alt={slide.title} />
                      <Show when={props.editorMode}>
                        <Popover content={t('Delete')}>
                          {(triggerRef: (el) => void) => (
                            <div
                              ref={triggerRef}
                              onClick={() => handleDelete(index())}
                              class={styles.action}
                            >
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
                        <div class={styles.slideDescription}>
                          <Show when={slide?.title}>
                            <div class={styles.articleTitle}>{slide.title}</div>
                          </Show>
                          <Show when={slide?.source}>
                            <div class={styles.source}>{slide.source}</div>
                          </Show>
                          <Show when={slide?.body}>
                            <div class={styles.body}>
                              <MD body={slide.body} />
                            </div>
                          </Show>
                        </div>
                      </Match>
                    </Switch>
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
                [styles.disabled]: slideIndex() + 1 === props.images.length
              })}
              onClick={() => mainSwipeRef.current.swiper.slideNext()}
            >
              <Icon name="swiper-r-arr" class={styles.icon} />
            </div>
            <div class={styles.counter}>
              {slideIndex() + 1} / {props.images.length}
            </div>
          </div>

          <div class={clsx(styles.holder, styles.thumbsHolder)}>
            <div class={styles.thumbs}>
              <swiper-container
                class={'thumbSwiper'}
                ref={(el) => (thumbSwipeRef.current = el)}
                slides-per-view={'auto'}
                free-mode={true}
                observer={true}
                space-between={20}
                auto-scroll-offset={1}
                watch-overflow={true}
                slide-to-clicked-slide={true}
                watch-slides-visibility={true}
                watch-slides-progress={true}
                direction={props.editorMode ? 'horizontal' : 'vertical'}
                slides-offset-after={props.editorMode && 140}
              >
                <For each={props.images}>
                  {(slide, index) => (
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    <swiper-slide virtual-index={index()} style={{ width: 'auto', height: 'auto' }}>
                      <div
                        class={clsx(styles.imageThumb)}
                        style={{ 'background-image': `url(${imageProxy(slide.url)})` }}
                      >
                        <Show when={props.editorMode}>
                          <div class={styles.thumbAction}>
                            <div class={clsx(styles.action)} onClick={() => handleDelete(index())}>
                              <Icon class={styles.icon} name="delete-white" />
                            </div>
                            <div
                              class={clsx(styles.action, {
                                [styles.hidden]: index() === 0
                              })}
                              onClick={() => handleChangeIndex('left', index())}
                            >
                              <Icon
                                class={styles.icon}
                                name="arrow-right-white"
                                style={{ transform: 'rotate(-180deg)' }}
                              />
                            </div>
                            <div
                              class={clsx(styles.action, {
                                [styles.hidden]: index() + 1 === Number(props.images.length)
                              })}
                              onClick={() => handleChangeIndex('right', index())}
                            >
                              <Icon class={styles.icon} name="arrow-right-white" />
                            </div>
                          </div>
                        </Show>
                      </div>
                    </swiper-slide>
                  )}
                </For>
                <Show when={props.editorMode}>
                  <div class={styles.upload}>
                    <div class={styles.inner} onClick={handleUploadThumb}>
                      <Show when={!loading()} fallback={<Loading size="small" />}>
                        <Icon name="swiper-plus" />
                      </Show>
                    </div>
                  </div>
                </Show>
              </swiper-container>
              <div
                class={clsx(styles.navigation, styles.thumbsNav, styles.prev, {
                  [styles.disabled]: slideIndex() === 0
                })}
                onClick={() => thumbSwipeRef.current.swiper.slidePrev()}
              >
                <Icon iconClassName={styles.icon} name="swiper-l-arr" class={styles.icon} />
              </div>
              <div
                class={clsx(styles.navigation, styles.thumbsNav, styles.next, {
                  [styles.disabled]: slideIndex() + 1 === props.images.length
                })}
                onClick={() => thumbSwipeRef.current.swiper.slideNext()}
              >
                <Icon name="swiper-r-arr" iconClassName={styles.icon} class={styles.icon} />
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}

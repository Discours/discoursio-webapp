import { UploadFile, createFileUploader } from '@solid-primitives/upload'
import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal, lazy, on, onMount } from 'solid-js'
import SwiperCore from 'swiper'
import { Manipulation, Navigation, Pagination } from 'swiper/modules'
import { useLocalize } from '~/context/localize'
import { useSnackbar } from '~/context/ui'
import { composeMediaItems } from '~/lib/composeMediaItems'
import { getImageUrl } from '~/lib/getThumbUrl'
import { handleImageUpload } from '~/lib/handleImageUpload'
import { validateUploads } from '~/lib/validateUploads'
import { DropArea } from '../DropArea'
import { Icon } from '../Icon'
import { Image } from '../Image'
import { Loading } from '../Loading'
import { Popover } from '../Popover'

import { SwiperRef } from './swiper'

import { useSession } from '~/context/session'
import { MediaItem } from '~/types/mediaitem'
import { UploadedFile } from '~/types/upload'
import styles from './Swiper.module.scss'

const MicroEditor = lazy(() => import('../../Editor/MicroEditor/MicroEditor'))

type Props = {
  images: MediaItem[]
  onImagesAdd?: (value: MediaItem[]) => void
  onImagesSorted?: (value: MediaItem[]) => void
  onImageDelete?: (mediaItemIndex: number) => void
  onImageChange?: (index: number, value: MediaItem) => void
}

export const EditorSwiper = (props: Props) => {
  const { t } = useLocalize()
  const [loading, setLoading] = createSignal(false)
  const [slideIndex, setSlideIndex] = createSignal(0)
  const [slideBody, setSlideBody] = createSignal<string>()
  const { session } = useSession()
  let mainSwipeRef: SwiperRef | null
  let thumbSwipeRef: SwiperRef | null

  const { showSnackbar } = useSnackbar()

  const handleSlideDescriptionChange = (index: number, field: string, value: string | undefined) => {
    if (props.onImageChange) {
      props.onImageChange(index, { ...props.images[index], [field]: value })
    }
  }
  const swipeToUploaded = () => {
    setTimeout(() => {
      mainSwipeRef?.swiper.slideTo(props.images.length - 1)
    }, 0)
  }
  const handleSlideChange = () => {
    thumbSwipeRef?.swiper.slideTo(mainSwipeRef?.swiper.activeIndex || 0)
    setSlideIndex(mainSwipeRef?.swiper.activeIndex || 0)
  }

  createEffect(
    on(
      () => props.images.length,
      (_) => {
        mainSwipeRef?.swiper.update()
        thumbSwipeRef?.swiper.update()
      },
      { defer: true }
    )
  )
  const handleDropAreaUpload = (value: UploadedFile[]) => {
    props.onImagesAdd?.(composeMediaItems(value))
    swipeToUploaded()
  }

  const handleDelete = (index: number) => {
    props.onImageDelete?.(index)

    if (index === 0) {
      mainSwipeRef?.swiper.update()
    } else {
      mainSwipeRef?.swiper.slideTo(index - 1)
    }
  }

  const { selectFiles } = createFileUploader({
    multiple: true,
    accept: 'image/*'
  })

  const initUpload = async (selectedFiles: UploadFile[]) => {
    const isValid = validateUploads('image', selectedFiles)

    if (!isValid) {
      await showSnackbar({ type: 'error', body: t('Invalid file type') })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const results: UploadedFile[] = []
      for (const file of selectedFiles) {
        const result = await handleImageUpload(file, session()?.access_token || '')
        results.push(result)
      }
      props.onImagesAdd?.(composeMediaItems(results))
      setLoading(false)
      swipeToUploaded()
    } catch (error) {
      console.error('[runUpload]', error)
      showSnackbar({ type: 'error', body: t('Error') })
      setLoading(false)
    }
  }
  const handleUploadThumb = async () => {
    selectFiles((selectedFiles) => {
      initUpload(selectedFiles)
    })
  }

  const handleChangeIndex = (direction: 'left' | 'right', index: number) => {
    const images = [...props.images]
    if (images?.length > 0) {
      if (direction === 'left' && index > 0) {
        const copy = images.splice(index, 1)[0]
        images.splice(index - 1, 0, copy)
      } else if (direction === 'right' && index < images.length - 1) {
        const copy = images.splice(index, 1)[0]
        images.splice(index + 1, 0, copy)
      }
      props.onImagesSorted?.(images)
      setTimeout(() => {
        mainSwipeRef?.swiper.slideTo(direction === 'left' ? index - 1 : index + 1)
      }, 0)
    }
  }

  const handleSaveBeforeSlideChange = () => {
    handleSlideDescriptionChange(slideIndex(), 'body', slideBody())
  }

  onMount(async () => {
    const { register } = await import('swiper/element/bundle')
    register()
    SwiperCore.use([Pagination, Navigation, Manipulation])
  })

  return (
    <div class={clsx(styles.Swiper, styles.editorMode)}>
      <div class={styles.container}>
        <Show when={props.images.length === 0}>
          <DropArea
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
              ref={(el) => (mainSwipeRef = el)}
              slides-per-view={1}
              thumbs-swiper={'.thumbSwiper'}
              observer={true}
              onSlideChange={handleSlideChange}
              onBeforeSlideChangeStart={handleSaveBeforeSlideChange}
              space-between={20}
            >
              <For each={props.images}>
                {(slide, index) => (
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  <swiper-slide lazy="true" virtual-index={index()}>
                    <div class={styles.image}>
                      <Image src={slide.url} alt={slide.title} width={800} />

                      <Popover content={t('Delete')}>
                        {(triggerRef: (el: HTMLElement) => void) => (
                          <div ref={triggerRef} onClick={() => handleDelete(index())} class={styles.action}>
                            <Icon class={styles.icon} name="delete-white" />
                          </div>
                        )}
                      </Popover>
                    </div>
                  </swiper-slide>
                )}
              </For>
            </swiper-container>
            <div
              class={clsx(styles.navigation, styles.prev, {
                [styles.disabled]: slideIndex() === 0
              })}
              onClick={() => mainSwipeRef?.swiper.slidePrev()}
            >
              <Icon name="swiper-l-arr" class={styles.icon} />
            </div>
            <div
              class={clsx(styles.navigation, styles.next, {
                [styles.disabled]: slideIndex() + 1 === props.images.length
              })}
              onClick={() => mainSwipeRef?.swiper.slideNext()}
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
                ref={(el) => (thumbSwipeRef = el)}
                slides-per-view={'auto'}
                space-between={20}
                auto-scroll-offset={1}
                watch-overflow={true}
                watch-slides-visibility={true}
                direction={'horizontal'}
                slides-offset-after={160}
                slides-offset-before={30}
              >
                <For each={props.images}>
                  {(slide, index) => (
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    <swiper-slide virtual-index={index()} style={{ width: 'auto', height: 'auto' }}>
                      <div
                        class={clsx(styles.imageThumb)}
                        style={{
                          'background-image': `url(${getImageUrl(slide.url, { width: 110, height: 75 })})`
                        }}
                      >
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
                              [styles.hidden]: index() === props.images.length - 1
                            })}
                            onClick={() => handleChangeIndex('right', index())}
                          >
                            <Icon class={styles.icon} name="arrow-right-white" />
                          </div>
                        </div>
                      </div>
                    </swiper-slide>
                  )}
                </For>

                <div class={styles.upload}>
                  <div class={styles.inner} onClick={handleUploadThumb}>
                    <Show when={!loading()} fallback={<Loading size="small" />}>
                      <Icon name="swiper-plus" />
                    </Show>
                  </div>
                </div>
              </swiper-container>
              <div
                class={clsx(styles.navigation, styles.thumbsNav, styles.prev, {
                  [styles.disabled]: slideIndex() === 0
                })}
                onClick={() => thumbSwipeRef?.swiper.slidePrev()}
              >
                <Icon name="swiper-l-arr" class={styles.icon} />
              </div>
              <div
                class={clsx(styles.navigation, styles.thumbsNav, styles.next, {
                  [styles.disabled]: slideIndex() + 1 === props.images.length
                })}
                onClick={() => thumbSwipeRef?.swiper.slideNext()}
              >
                <Icon name="swiper-r-arr" class={styles.icon} />
              </div>
            </div>
          </div>
        </Show>
      </div>

      <Show when={props.images.length > 0}>
        <div class={styles.description}>
          <input
            type="text"
            class={clsx(styles.input, styles.title)}
            placeholder={t('Enter image title')}
            value={props.images[slideIndex()]?.title}
            onChange={(event) => handleSlideDescriptionChange(slideIndex(), 'title', event.target.value)}
          />
          <input
            type="text"
            class={styles.input}
            placeholder={t('Specify the source and the name of the author')}
            value={props.images[slideIndex()]?.source}
            onChange={(event) => handleSlideDescriptionChange(slideIndex(), 'source', event.target.value)}
          />
          <MicroEditor
            content={props.images[slideIndex()]?.body}
            placeholder={t('Enter image description')}
            onChange={(value) => setSlideBody(value)}
          />
        </div>
      </Show>
    </div>
  )
}

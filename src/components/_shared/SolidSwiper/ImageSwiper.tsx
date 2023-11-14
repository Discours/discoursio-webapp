import { createFileUploader } from '@solid-primitives/upload'
import { clsx } from 'clsx'
import { createEffect, createSignal, For, Show, on, onMount } from 'solid-js'
import SwiperCore, { Manipulation, Navigation, Pagination } from 'swiper'

import { useLocalize } from '../../../context/localize'
import { useSnackbar } from '../../../context/snackbar'
import { MediaItem, UploadedFile } from '../../../pages/types'
import { composeMediaItems } from '../../../utils/composeMediaItems'
import { getImageUrl } from '../../../utils/getImageUrl'
import { handleImageUpload } from '../../../utils/handleImageUpload'
import { validateFiles } from '../../../utils/validateFile'
import SimplifiedEditor from '../../Editor/SimplifiedEditor'
import { DropArea } from '../DropArea'
import { Icon } from '../Icon'
import { Image } from '../Image'
import { Loading } from '../Loading'
import { Popover } from '../Popover'

import { SwiperRef } from './swiper'

import styles from './Swiper.module.scss'

type Props = {
  images: MediaItem[]
  editorMode?: boolean
  onImagesAdd?: (value: MediaItem[]) => void
  onImagesSorted?: (value: MediaItem[]) => void
  onImageDelete?: (mediaItemIndex: number) => void
  onImageChange?: (index: number, value: MediaItem) => void
}

export const ImageSwiper = (props: Props) => {
  const { t } = useLocalize()
  const [loading, setLoading] = createSignal(false)
  const [slideIndex, setSlideIndex] = createSignal(0)
  const [slideBody, setSlideBody] = createSignal<string>()

  const mainSwipeRef: { current: SwiperRef } = { current: null }
  const thumbSwipeRef: { current: SwiperRef } = { current: null }

  const {
    actions: { showSnackbar },
  } = useSnackbar()

  const handleSlideDescriptionChange = (index: number, field: string, value) => {
    if (props.onImageChange) {
      props.onImageChange(index, { ...props.images[index], [field]: value })
    }
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
      },
      { defer: true },
    ),
  )
  const handleDropAreaUpload = (value: UploadedFile[]) => {
    props.onImagesAdd(composeMediaItems(value))
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
    accept: `image/*`,
  })

  const initUpload = async (selectedFiles) => {
    const isValid = validateFiles('image', selectedFiles)
    if (isValid) {
      try {
        setLoading(true)
        const results: UploadedFile[] = []
        for (const file of selectedFiles) {
          const result = await handleImageUpload(file)
          results.push(result)
        }
        props.onImagesAdd(composeMediaItems(results))
        setLoading(false)
        swipeToUploaded()
      } catch (error) {
        await showSnackbar({ type: 'error', body: t('Error') })
        console.error('[runUpload]', error)
        setLoading(false)
      }
    } else {
      await showSnackbar({ type: 'error', body: t('Invalid file type') })
      setLoading(false)
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

  const handleSaveBeforeSlideChange = () => {
    handleSlideDescriptionChange(slideIndex(), 'body', slideBody())
  }

  onMount(async () => {
    const { register } = await import('swiper/element/bundle')
    register()
    SwiperCore.use([Pagination, Navigation, Manipulation])
  })

  return (
    <div class={clsx(styles.Swiper, props.editorMode ? styles.editorMode : styles.articleMode)}>
      <div class={styles.container}>
        <Show when={props.editorMode && props.images.length === 0}>
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
              ref={(el) => (mainSwipeRef.current = el)}
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
                      <Image src={slide.url} alt={slide.title} width={1600} />
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
                  </swiper-slide>
                )}
              </For>
            </swiper-container>
            <div
              class={clsx(styles.navigation, styles.prev, {
                [styles.disabled]: slideIndex() === 0,
              })}
              onClick={() => mainSwipeRef.current.swiper.slidePrev()}
            >
              <Icon name="swiper-l-arr" class={styles.icon} />
            </div>
            <div
              class={clsx(styles.navigation, styles.next, {
                [styles.disabled]: slideIndex() + 1 === props.images.length,
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
                space-between={20}
                auto-scroll-offset={1}
                watch-overflow={true}
                watch-slides-visibility={true}
                direction={props.editorMode ? 'horizontal' : 'vertical'}
                slides-offset-after={props.editorMode && 160}
                slides-offset-before={props.editorMode && 30}
              >
                <For each={props.images}>
                  {(slide, index) => (
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    <swiper-slide virtual-index={index()} style={{ width: 'auto', height: 'auto' }}>
                      <div
                        class={clsx(styles.imageThumb)}
                        style={{
                          'background-image': `url(${getImageUrl(slide.url, { width: 110, height: 75 })})`,
                        }}
                      >
                        <Show when={props.editorMode}>
                          <div class={styles.thumbAction}>
                            <div class={clsx(styles.action)} onClick={() => handleDelete(index())}>
                              <Icon class={styles.icon} name="delete-white" />
                            </div>
                            <div
                              class={clsx(styles.action, {
                                [styles.hidden]: index() === 0,
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
                                [styles.hidden]: index() === props.images.length - 1,
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
                  [styles.disabled]: slideIndex() === 0,
                })}
                onClick={() => thumbSwipeRef.current.swiper.slidePrev()}
              >
                <Icon name="swiper-l-arr" class={styles.icon} />
              </div>
              <div
                class={clsx(styles.navigation, styles.thumbsNav, styles.next, {
                  [styles.disabled]: slideIndex() + 1 === props.images.length,
                })}
                onClick={() => thumbSwipeRef.current.swiper.slideNext()}
              >
                <Icon name="swiper-r-arr" class={styles.icon} />
              </div>
            </div>
          </div>
        </Show>
      </div>
      <Show
        when={props.editorMode}
        fallback={
          <div class={styles.slideDescription}>
            <Show when={props.images[slideIndex()]?.title}>
              <div class={styles.articleTitle}>{props.images[slideIndex()].title}</div>
            </Show>
            <Show when={props.images[slideIndex()]?.source}>
              <div class={styles.source}>{props.images[slideIndex()].source}</div>
            </Show>
            <Show when={props.images[slideIndex()]?.body}>
              <div class={styles.body} innerHTML={props.images[slideIndex()].body} />
            </Show>
          </div>
        }
      >
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
            <SimplifiedEditor
              initialContent={props.images[slideIndex()]?.body}
              smallHeight={true}
              placeholder={t('Enter image description')}
              onChange={(value) => setSlideBody(value)}
            />
          </div>
        </Show>
      </Show>
    </div>
  )
}

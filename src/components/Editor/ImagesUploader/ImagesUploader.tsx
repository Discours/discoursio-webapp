import { createEffect, createSignal, For, JSX, Show } from 'solid-js'
import styles from './ImagesUploader.module.scss'
import { clsx } from 'clsx'
import { DropArea } from '../../_shared/DropArea'
import { useLocalize } from '../../../context/localize'
import { MediaItem } from '../../../pages/types'
import { imageProxy } from '../../../utils/imageProxy'
import { GrowingTextarea } from '../../_shared/GrowingTextarea'
import { SolidSwiper } from '../../_shared/SolidSwiper'

type Props = {
  class?: string
  images: (value: MediaItem[]) => void
}

const mock = [
  'http://cdn.discours.io/4e09b3e5-aeac-4f0e-9249-be7ef9067f52.png',
  'http://cdn.discours.io/8abdfe6b-eef7-4126-974f-26a89e1674aa.png',
  'http://cdn.discours.io/0ca27f02-9f3d-4a4f-b26b-5eaaf517e582.png',
  'http://cdn.discours.io/77f24b9b-bde7-470d-bdd9-278b40f5b207.jpeg',
  'http://cdn.discours.io/25bf14aa-d415-4ae1-b7c4-9bd732ad2af7.jpeg',
  'http://cdn.discours.io/0be24718-513b-49b3-ad23-804a18b84850.jpeg'
]

const composeMedia = (value) => {
  return value.map((url) => {
    return {
      url: imageProxy(url),
      title: '',
      body: ''
    }
  })
}

export const ImagesUploader = (props: Props) => {
  const { t } = useLocalize()
  const [data, setData] = createSignal<MediaItem[]>(composeMedia(mock))
  const [slideIdx, setSlideIdx] = createSignal<number>(0)

  createEffect((prevData) => {
    if (prevData !== data() && data().length > 0) {
      props.images(data())
    }
  }, data())

  const handleTitleChange = (index: number, field: string, value) => {
    console.log('!!! index change:', index)
    setData((prev) => {
      return prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    })
  }

  createEffect(() => {
    console.log('!!! IDX:', slideIdx())
  })
  return (
    <div class={clsx(styles.ImagesUploader, props.class)}>
      <Show
        when={data() && data().length > 0}
        fallback={
          <DropArea
            fileType="image"
            isMultiply={true}
            placeholder={t('Add images')}
            data={(value) => setData(composeMedia(value))}
            description={
              <div>
                {t('You can upload up to 100 images in .jpg, .png format.')}
                <br />
                {t('Each image must be no larger than 5 MB.')}
              </div>
            }
          />
        }
      >
        <SolidSwiper slides={data()} slideIndex={(idx) => setSlideIdx(idx)} />

        {/*<For each={data()}>*/}
        {/*  {(img) => (*/}
        {/*    <div class="swiper-slide">*/}
        {/*      <div class={styles.slide}>*/}
        {/*        <img class={styles.image} src={img.url} alt={img.title} loading="lazy" />*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  )}*/}
        {/*</For>*/}

        <div class={styles.description}>
          <GrowingTextarea
            class={styles.descriptionText}
            placeholder={t('Enter image description')}
            initialValue={data()[slideIdx()]?.body}
            value={(value) => handleTitleChange(slideIdx(), 'body', value)}
          />
          <input
            type="text"
            class={styles.input}
            placeholder={t('Specify the source and the name of the author')}
            value={data()[slideIdx()]?.title}
            onChange={(event) => handleTitleChange(slideIdx(), 'title', event.target.value)}
          />
        </div>
      </Show>
    </div>
  )
}

import { createSignal, For, Show } from 'solid-js'
import styles from './ImagesUploader.module.scss'
import { clsx } from 'clsx'
import { DropArea } from '../../_shared/DropArea'
import { useLocalize } from '../../../context/localize'
import { Slider } from '../../_shared/Slider'
import { MediaItem } from '../../../pages/types'
import { imageProxy } from '../../../utils/imageProxy'

type Props = {
  class?: string
}

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
  const [data, setData] = createSignal<MediaItem[]>()

  const handleTitleChange = (index: number, field: string, event) => {
    setData((prev) => {
      return prev.map((item, idx) => (idx === index ? { ...item, [field]: event.target.value } : item))
    })
  }

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
        <Slider slidesPerView={1}>
          <For each={data()}>
            {(img, index) => (
              <div class="swiper-slide">
                <div class={styles.sliderSlide}>
                  <img class={styles.sliderImage} src={img.url} alt={''} loading="lazy" />
                </div>
                <div class={styles.sliderDescription}>
                  <input
                    type="text"
                    value={img.title}
                    onChange={(event) => handleTitleChange(index(), 'title', event)}
                  />
                  <input
                    type="text"
                    value={img.body}
                    onChange={(event) => handleTitleChange(index(), 'body', event)}
                  />
                </div>
              </div>
            )}
          </For>
        </Slider>
      </Show>

      {JSON.stringify(data(), null, '\t')}
    </div>
  )
}

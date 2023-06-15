import { clsx } from 'clsx'
import styles from './ImagesUploader.module.scss'
import { DropArea } from '../../_shared/DropArea'
import { useLocalize } from '../../../context/localize'
import { createSignal, For, Show } from 'solid-js'

import 'solid-slider/slider.css'
import { Slider, SliderButton } from 'solid-slider'

type Props = {
  class?: string
}

export const ImagesUploader = (props: Props) => {
  const { t } = useLocalize()
  const [data, setData] = createSignal<string[]>()
  return (
    <div class={clsx(styles.ImagesUploader, props.class)}>
      <Show
        when={data() && data().length > 0}
        fallback={
          <DropArea
            fileType="image"
            isMultiply={true}
            placeholder={t('Add images')}
            data={(value) => setData(value)}
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
        <Slider options={{ loop: true }}>
          <For each={data()}>
            {(url) => (
              <div>
                <img alt={''} src={url} />
              </div>
            )}
          </For>
        </Slider>
        <SliderButton prev>Previous</SliderButton>
        <SliderButton next>Next</SliderButton>
      </Show>
    </div>
  )
}

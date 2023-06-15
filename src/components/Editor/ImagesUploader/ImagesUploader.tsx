import { clsx } from 'clsx'
import styles from './ImagesUploader.module.scss'
import { DropArea } from '../../_shared/DropArea'
import { useLocalize } from '../../../context/localize'
import { createEffect, createSignal, For, Show } from 'solid-js'

type Props = {
  class?: string
}

export const ImagesUploader = (props: Props) => {
  const { t } = useLocalize()
  const [data, setData] = createSignal<string[]>()
  createEffect(() => {
    console.log('!!! data:', data())
  })
  return (
    <div class={clsx(styles.ImagesUploader, props.class)}>
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

      <Show when={data()}>
        <For each={data()}>{(url) => <img alt={'AAAA'} src={url} />}</For>
      </Show>
    </div>
  )
}

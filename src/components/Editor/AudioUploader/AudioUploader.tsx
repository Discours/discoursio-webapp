import { clsx } from 'clsx'
import styles from './AudioUploader.module.scss'
import { DropArea } from '../../_shared/DropArea'
import { useLocalize } from '../../../context/localize'
import { createSignal, For, Show } from 'solid-js'
import { MediaItem } from '../../../pages/types'
import { mediaItemsFromStringArray } from '../../../utils/mediaItemsFromStringArray'

type Props = {
  class?: string
}

const mock = [
  'http://cdn.discours.io/7b40b2cc-da4f-4186-8cdd-ae20b80fbe5e.wav',
  'http://cdn.discours.io/37558f41-1d1b-41bd-8621-88bea81f96c1.wav',
  'http://cdn.discours.io/0df62d81-a5ee-4aba-8a5a-79b9c1febb86.wav'
]
export const AudioUploader = (props: Props) => {
  const { t } = useLocalize()
  const [audio, setAudio] = createSignal<MediaItem[]>(mediaItemsFromStringArray(mock))
  return (
    <div class={clsx(styles.AudioUploader, props.class)}>
      <Show when={audio()}>
        <For each={audio()}>
          {(audioItem, index) => (
            <div data-key={index()}>
              <audio controls>
                <source src={audioItem.url} />
              </audio>
            </div>
          )}
        </For>
      </Show>
      <DropArea
        isMultiply={true}
        placeholder={t('Add audio')}
        description={t('You can download multiple tracks at once in .mp3, .wav or .flac formats')}
        fileType={'audio'}
        onUpload={(value) => {
          console.log(value)
        }}
      />
    </div>
  )
}

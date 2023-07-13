import { clsx } from 'clsx'
import styles from './AudioUploader.module.scss'
import { DropArea } from '../../_shared/DropArea'
import { useLocalize } from '../../../context/localize'
import { createSignal, onMount, Show } from 'solid-js'
import { MediaItem } from '../../../pages/types'
import { mediaItemsFromStringArray } from '../../../utils/mediaItemsFromStringArray'
import { AudioPlayer } from '../../Article/AudioPlayer'
import { Buffer } from 'buffer'

window.Buffer = Buffer

type Props = {
  class?: string
  audio: MediaItem[]
  onAudioChange: (index: number, value: MediaItem) => void
  onAudioAdd: (value: MediaItem[]) => void
}

const mock = [
  'http://cdn.discours.io/7b40b2cc-da4f-4186-8cdd-ae20b80fbe5e.wav',
  'http://cdn.discours.io/37558f41-1d1b-41bd-8621-88bea81f96c1.wav',
  'http://cdn.discours.io/0df62d81-a5ee-4aba-8a5a-79b9c1febb86.wav'
]

export const AudioUploader = (props: Props) => {
  const { t } = useLocalize()

  const handleAudioDescriptionChange = (index: number, field: string, value) => {
    props.onAudioChange(index, { ...props.audio[index], [field]: value })
  }

  return (
    <div class={clsx(styles.AudioUploader, props.class)}>
      <Show when={props.audio.length > 0}>
        <AudioPlayer editorMode={true} media={props.audio} onAudioChange={handleAudioDescriptionChange} />
      </Show>
      <DropArea
        isMultiply={true}
        placeholder={t('Add audio')}
        description={t('You can download multiple tracks at once in .mp3, .wav or .flac formats')}
        fileType={'audio'}
        onUpload={(value) => props.onAudioAdd(mediaItemsFromStringArray(value))}
      />
    </div>
  )
}

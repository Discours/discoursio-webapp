import { clsx } from 'clsx'
import styles from './AudioUploader.module.scss'
import { DropArea } from '../../_shared/DropArea'
import { useLocalize } from '../../../context/localize'
import { createEffect, createSignal, on, Show } from 'solid-js'
import { MediaItem } from '../../../pages/types'
import { composeMediaItems } from '../../../utils/composeMediaItems'
import { AudioPlayer } from '../../Article/AudioPlayer'
import { Buffer } from 'buffer'

window.Buffer = Buffer

type Props = {
  class?: string
  audio: MediaItem[]
  onAudioChange: (index: number, value: MediaItem) => void
  onAudioAdd: (value: MediaItem[]) => void
}

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
        onUpload={(value) => props.onAudioAdd(composeMediaItems(value))}
      />
    </div>
  )
}

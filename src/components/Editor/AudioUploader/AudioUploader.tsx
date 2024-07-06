import { clsx } from 'clsx'
import { Show } from 'solid-js'
import { isServer } from 'solid-js/web'
import { DropArea } from '~/components/_shared/DropArea'
import { useLocalize } from '~/context/localize'
import { MediaItem } from '~/types/mediaitem'
import { composeMediaItems } from '~/utils/composeMediaItems'
import { AudioPlayer } from '../../Article/AudioPlayer'
import styles from './AudioUploader.module.scss'


if (!isServer && window) window.Buffer = Buffer
console.debug('buffer patch passed')

type Props = {
  class?: string
  audio: MediaItem[]
  baseFields?: {
    artist?: string
    date?: string
    genre?: string
  }
  onAudioChange: (index: number, value: MediaItem) => void
  onAudioAdd: (value: MediaItem[]) => void
  onAudioSorted: (value: MediaItem[]) => void
}

export const AudioUploader = (props: Props) => {
  const { t } = useLocalize()

  const handleMediaItemFieldChange = (
    index: number,
    field: keyof MediaItem | string | symbol | number,
    value: string
  ) => {
    props.onAudioChange(index, { ...props.audio[index], [field]: value })
  }

  const handleChangeIndex = (direction: 'up' | 'down', index: number) => {
    const media = [...props.audio]
    if (media?.length > 0) {
      if (direction === 'up' && index > 0) {
        const copy = media.splice(index, 1)[0]
        media.splice(index - 1, 0, copy)
      } else if (direction === 'down' && index < media.length - 1) {
        const copy = media.splice(index, 1)[0]
        media.splice(index + 1, 0, copy)
      }
    }
    props.onAudioSorted(media)
  }

  return (
    <div class={clsx(styles.AudioUploader, props.class)}>
      <Show when={props.audio.length > 0}>
        <AudioPlayer
          editorMode={true}
          media={props.audio}
          onMediaItemFieldChange={handleMediaItemFieldChange}
          onChangeMediaIndex={handleChangeIndex}
        />
      </Show>
      <DropArea
        isMultiply={true}
        placeholder={t('Add audio')}
        description={t('You can download multiple tracks at once in .mp3, .wav or .flac formats')}
        fileType={'audio'}
        onUpload={(value) => props.onAudioAdd(composeMediaItems(value, props.baseFields))}
      />
    </div>
  )
}

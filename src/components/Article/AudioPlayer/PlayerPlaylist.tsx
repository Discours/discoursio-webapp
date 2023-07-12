import { createEffect, createSignal, For, Show } from 'solid-js'
import { SharePopup, getShareUrl } from '../SharePopup'
import { getDescription } from '../../../utils/meta'
import { useLocalize } from '../../../context/localize'
import type { Audio } from './AudioPlayer'
import { Popover } from '../../_shared/Popover'
import { Icon } from '../../_shared/Icon'
import styles from './AudioPlayer.module.scss'
import { GrowingTextarea } from '../../_shared/GrowingTextarea'

type Props = {
  tracks: Audio[]
  currentTrack: Audio
  playMedia: (audio: Audio) => void
  articleSlug?: string
  body?: string
  editorMode?: boolean
  changedAudio?: (value: Audio) => void
}

export const PlayerPlaylist = (props: Props) => {
  const { t } = useLocalize()
  const [activeEditIndex, setActiveEditIndex] = createSignal(-1)
  const [changedData, setChangedData] = createSignal<Audio>()

  const toggleEditMode = (index, audio) => {
    setActiveEditIndex(activeEditIndex() === index ? -1 : index)
    setChangedData(audio)
  }
  const updateData = (key, value) => {
    setChangedData((prev) => ({ ...prev, [key]: value }))
  }

  createEffect(() => {
    console.log('!!! changedData():', changedData())
    if (props.changedAudio && changedData()) {
      props.changedAudio(changedData())
    }
  })

  return (
    <ul class={styles.playlist}>
      <For each={props.tracks}>
        {(m: Audio, index) => (
          <li>
            <div class={styles.playlistItem}>
              <button
                class={styles.playlistItemPlayButton}
                onClick={() => props.playMedia(m)}
                type="button"
                aria-label="Play"
              >
                <Icon
                  name={
                    props.currentTrack &&
                    props.currentTrack.index === m.index &&
                    props.currentTrack.isPlaying
                      ? 'pause'
                      : 'play'
                  }
                />
              </button>
              <div class={styles.playlistItemTitle}>
                <Show
                  when={activeEditIndex() === index()}
                  fallback={m.title.trim() === '' ? t('Unknown artist') : m.title}
                >
                  <input
                    type="text"
                    class={styles.titleInput}
                    placeholder={m.title.trim() === '' ? t('Enter artist and song title') : m.title}
                    onChange={(e) => updateData('title', e.target.value)}
                    autofocus={true}
                  />
                </Show>
              </div>
              <div class={styles.shareMedia}>
                <Popover content={props.editorMode ? t('Edit') : t('Share')}>
                  {(triggerRef: (el) => void) => (
                    <div ref={triggerRef}>
                      <Show
                        when={!props.editorMode}
                        fallback={
                          <button type="button" onClick={() => toggleEditMode(index(), m)}>
                            <Icon name="pencil-stroke" />
                          </button>
                        }
                      >
                        <SharePopup
                          title={m.title}
                          description={getDescription(props.body)}
                          imageUrl={m.pic}
                          shareUrl={getShareUrl({ pathname: `/${props.articleSlug}` })}
                          trigger={
                            <div>
                              <Icon name="share-media" />
                            </div>
                          }
                        />
                      </Show>
                    </div>
                  )}
                </Popover>
              </div>
            </div>
            <Show when={activeEditIndex() === index()}>
              <div class={styles.descriptionBlock}>
                <GrowingTextarea
                  class={styles.description}
                  placeholder={t('Description')}
                  value={(value) => updateData('body', value)}
                  initialValue={''}
                />
                <GrowingTextarea
                  class={styles.lyrics}
                  initialValue={''}
                  placeholder={t('Song lyrics')}
                  value={(value) => updateData('lyrics', value)}
                />
              </div>
            </Show>
          </li>
        )}
      </For>
    </ul>
  )
}

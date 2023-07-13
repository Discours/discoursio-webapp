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
  onAudioChange?: (index: number, field: string, value: string) => void
}

export const PlayerPlaylist = (props: Props) => {
  const { t } = useLocalize()
  const [activeEditIndex, setActiveEditIndex] = createSignal(-1)

  const toggleDropDown = (index) => {
    setActiveEditIndex(activeEditIndex() === index ? -1 : index)
  }
  const updateData = (key, value) => {
    props.onAudioChange(activeEditIndex(), key, value)
  }

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
                  fallback={
                    <>
                      <div class={styles.title}>{m.title || t('Song title')}</div>
                      <div class={styles.artist}>{m.artist || t('Artist')}</div>
                    </>
                  }
                >
                  <input
                    type="text"
                    class={styles.title}
                    placeholder={m.title || t('Song title')}
                    onChange={(e) => updateData('title', e.target.value)}
                  />
                  <input
                    type="text"
                    class={styles.artist}
                    placeholder={m.artist || t('Artist')}
                    onChange={(e) => updateData('artist', e.target.value)}
                  />
                </Show>
              </div>
              <div class={styles.actions}>
                <Show when={m.lyrics && !props.editorMode}>
                  <Popover content={t('Show lyrics')}>
                    {(triggerRef: (el) => void) => (
                      <button ref={triggerRef} type="button" onClick={() => toggleDropDown(index())}>
                        <Icon name="list" />
                      </button>
                    )}
                  </Popover>
                </Show>
                <Popover content={props.editorMode ? t('Edit') : t('Share')}>
                  {(triggerRef: (el) => void) => (
                    <div ref={triggerRef}>
                      <Show
                        when={!props.editorMode}
                        fallback={
                          <button type="button" onClick={() => toggleDropDown(index())}>
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
              <Show
                when={props.editorMode}
                fallback={
                  <div class={styles.descriptionBlock}>
                    <Show when={m.body}>
                      <div class={styles.description}>{m.body}</div>
                    </Show>
                    <Show when={m.lyrics}>
                      <div class={styles.lyrics}>{m.lyrics}</div>
                    </Show>
                  </div>
                }
              >
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
            </Show>
          </li>
        )}
      </For>
    </ul>
  )
}

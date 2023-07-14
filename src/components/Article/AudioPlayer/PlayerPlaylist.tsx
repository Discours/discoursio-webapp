import { createEffect, createSignal, For, Show } from 'solid-js'
import { SharePopup, getShareUrl } from '../SharePopup'
import { getDescription } from '../../../utils/meta'
import { useLocalize } from '../../../context/localize'
import type { Audio } from './AudioPlayer'
import { Popover } from '../../_shared/Popover'
import { Icon } from '../../_shared/Icon'
import styles from './AudioPlayer.module.scss'
import { GrowingTextarea } from '../../_shared/GrowingTextarea'
import MD from '../MD'

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
                  when={activeEditIndex() === index() && props.editorMode}
                  fallback={
                    <>
                      <div class={styles.title}>
                        {m.title.replace(/\.(wav|flac|mp3|aac)$/i, '') || t('Song title')}
                      </div>
                      <div class={styles.artist}>{m.artist || t('Artist')}</div>
                    </>
                  }
                >
                  <input
                    type="text"
                    value={m.title}
                    class={styles.title}
                    placeholder={t('Song title')}
                    onChange={(e) => updateData('title', e.target.value)}
                  />
                  <input
                    type="text"
                    value={m.artist}
                    class={styles.artist}
                    placeholder={t('Artist')}
                    onChange={(e) => updateData('artist', e.target.value)}
                  />
                </Show>
              </div>
              <div class={styles.actions}>
                <Show when={(m.lyrics || m.body) && !props.editorMode}>
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
                      <div class={styles.description}>
                        <MD body={m.body} />
                      </div>
                    </Show>
                    <Show when={m.lyrics}>
                      <div class={styles.lyrics}>
                        <MD body={m.lyrics} />
                      </div>
                    </Show>
                  </div>
                }
              >
                <div class={styles.descriptionBlock}>
                  <GrowingTextarea
                    allowEnterKey={true}
                    class={styles.description}
                    placeholder={t('Description')}
                    value={(value) => updateData('body', value)}
                    initialValue={m.body || ''}
                  />
                  <GrowingTextarea
                    allowEnterKey={true}
                    class={styles.lyrics}
                    placeholder={t('Song lyrics')}
                    value={(value) => updateData('lyrics', value)}
                    initialValue={m.lyrics || ''}
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

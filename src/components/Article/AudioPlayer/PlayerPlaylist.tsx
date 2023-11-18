import { createSignal, For, lazy, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { MediaItem } from '../../../pages/types'
import { getDescription } from '../../../utils/meta'
import { Icon } from '../../_shared/Icon'
import { Popover } from '../../_shared/Popover'
import { SharePopup, getShareUrl } from '../SharePopup'

import styles from './AudioPlayer.module.scss'

const SimplifiedEditor = lazy(() => import('../../Editor/SimplifiedEditor'))
const GrowingTextarea = lazy(() => import('../../_shared/GrowingTextarea/GrowingTextarea'))

type Props = {
  media: MediaItem[]
  currentTrackIndex: number
  isPlaying: boolean
  onPlayMedia: (trackIndex: number) => void
  articleSlug?: string
  body?: string
  editorMode?: boolean
  onMediaItemFieldChange?: (index: number, field: keyof MediaItem, value: string) => void
  onChangeMediaIndex?: (direction: 'up' | 'down', index) => void
}

export const PlayerPlaylist = (props: Props) => {
  const { t } = useLocalize()
  const [activeEditIndex, setActiveEditIndex] = createSignal(-1)

  const toggleDropDown = (index) => {
    setActiveEditIndex(activeEditIndex() === index ? -1 : index)
  }
  const handleMediaItemFieldChange = (field: keyof MediaItem, value: string) => {
    props.onMediaItemFieldChange(activeEditIndex(), field, value)
  }

  return (
    <ul class={styles.playlist}>
      <For each={props.media}>
        {(mi, index) => (
          <li>
            <div class={styles.playlistItem}>
              <button
                class={styles.playlistItemPlayButton}
                onClick={() => props.onPlayMedia(index())}
                type="button"
                aria-label="Play"
              >
                <Icon name={props.currentTrackIndex === index() && props.isPlaying ? 'pause' : 'play'} />
              </button>
              <div class={styles.playlistItemText}>
                <Show
                  when={activeEditIndex() === index() && props.editorMode}
                  fallback={
                    <>
                      <div class={styles.title}>{mi.title || t('Song title')}</div>
                      <div class={styles.artist}>{mi.artist || t('Artist')}</div>
                    </>
                  }
                >
                  <input
                    type="text"
                    value={mi.title}
                    class={styles.title}
                    placeholder={t('Song title')}
                    onChange={(e) => handleMediaItemFieldChange('title', e.target.value)}
                  />
                  <input
                    type="text"
                    value={mi.artist}
                    class={styles.artist}
                    placeholder={t('Artist')}
                    onChange={(e) => handleMediaItemFieldChange('artist', e.target.value)}
                  />
                </Show>
              </div>
              <div class={styles.actions}>
                <Show when={props.editorMode}>
                  <Popover content={t('Move up')}>
                    {(triggerRef: (el) => void) => (
                      <button
                        type="button"
                        ref={triggerRef}
                        class={styles.action}
                        disabled={index() === 0}
                        onClick={() => props.onChangeMediaIndex('up', index())}
                      >
                        <Icon name="up-button" />
                      </button>
                    )}
                  </Popover>
                  <Popover content={t('Move down')}>
                    {(triggerRef: (el) => void) => (
                      <button
                        type="button"
                        ref={triggerRef}
                        class={styles.action}
                        disabled={index() === props.media.length - 1}
                        onClick={() => props.onChangeMediaIndex('down', index())}
                      >
                        <Icon name="up-button" class={styles.moveIconDown} />
                      </button>
                    )}
                  </Popover>
                </Show>
                <Show when={(mi.lyrics || mi.body) && !props.editorMode}>
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
                          title={mi.title}
                          description={getDescription(props.body)}
                          imageUrl={mi.pic}
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
                    <Show when={mi.body}>
                      <div class={styles.description}>
                        <div innerHTML={mi.body} />
                      </div>
                    </Show>
                    <Show when={mi.lyrics}>
                      <div class={styles.lyrics}>
                        <div innerHTML={mi.lyrics} />
                      </div>
                    </Show>
                  </div>
                }
              >
                <div class={styles.descriptionBlock}>
                  <SimplifiedEditor
                    initialContent={mi.body}
                    placeholder={`${t('Description')}...`}
                    smallHeight={true}
                    onChange={(value) => handleMediaItemFieldChange('body', value)}
                  />
                  <GrowingTextarea
                    allowEnterKey={true}
                    class={styles.lyrics}
                    placeholder={t('Song lyrics')}
                    value={(value) => handleMediaItemFieldChange('lyrics', value)}
                    initialValue={mi.lyrics || ''}
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

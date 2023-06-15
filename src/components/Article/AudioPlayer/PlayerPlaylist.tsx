import { For } from 'solid-js'

import { SharePopup, getShareUrl } from '../SharePopup'
import { getDescription } from '../../../utils/meta'

import { useLocalize } from '../../../context/localize'

import type { MediaItem } from './AudioPlayer'

import { Popover } from '../../_shared/Popover'
import { Icon } from '../../_shared/Icon'

import styles from './AudioPlayer.module.scss'

export const PlayerPlaylist = (props) => {
  const { t } = useLocalize()

  const { tracks, getCurrentTrack, playMedia, articleSlug } = props

  return (
    <ul class={styles.playlist}>
      <For each={tracks}>
        {(m: MediaItem) => (
          <li class={styles.playlistItem}>
            <button
              class={styles.playlistItemPlayButton}
              onClick={() => playMedia(m)}
              role="button"
              aria-label="Play"
            >
              <Icon
                name={
                  getCurrentTrack() && getCurrentTrack().id === m.id && getCurrentTrack().isPlaying
                    ? 'pause'
                    : 'play'
                }
              />
            </button>
            <div class={styles.playlistItemTitle}>{m.title}</div>
            <div class={styles.shareMedia}>
              <Popover content={t('Share')}>
                {(triggerRef: (el) => void) => (
                  <div ref={triggerRef}>
                    <SharePopup
                      //@@ TODO discuss title
                      title={`Checkout ${m.title} on Discours`}
                      description={getDescription(m.body)}
                      imageUrl={m.pic}
                      shareUrl={getShareUrl({ pathname: `/${articleSlug}` })}
                      trigger={
                        <div>
                          <Icon name="share-media" />
                        </div>
                      }
                    />
                  </div>
                )}
              </Popover>
            </div>
          </li>
        )}
      </For>
    </ul>
  )
}

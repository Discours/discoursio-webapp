import { createSignal, Show } from 'solid-js'
import { clsx } from 'clsx'

import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'

import { Icon } from '../../_shared/Icon'
import styles from './AudioPlayer.module.scss'
import { MediaItem } from '../../../pages/types'

type Props = {
  onPlayMedia: () => void
  playPrevTrack: () => void
  playNextTrack: () => void
  onVolumeChange: (volume: number) => void
  isPlaying: boolean
  currentTrack: MediaItem
}

export const PlayerHeader = (props: Props) => {
  const volumeContainerRef: { current: HTMLDivElement } = {
    current: null
  }

  const [isVolumeBarOpened, setIsVolumeBarOpened] = createSignal(false)

  const toggleVolumeBar = () => {
    setIsVolumeBarOpened(!isVolumeBarOpened())
  }

  useOutsideClickHandler({
    containerRef: volumeContainerRef,
    predicate: () => isVolumeBarOpened(),
    handler: () => toggleVolumeBar()
  })

  return (
    <div class={styles.playerHeader}>
      <div class={styles.playerTitle}>{props.currentTrack.title}</div>
      <div class={styles.playerControls}>
        <button
          type="button"
          onClick={props.onPlayMedia}
          class={clsx(
            styles.playButton,
            props.isPlaying ? styles.playButtonInvertPause : styles.playButtonInvertPlay
          )}
          aria-label="Play"
          data-playing="false"
        >
          <Icon name={props.isPlaying ? 'pause' : 'play'} />
        </button>
        <button
          type="button"
          onClick={props.playPrevTrack}
          class={clsx(styles.controlsButton)}
          aria-label="Previous"
        >
          <Icon name="player-arrow" />
        </button>
        <button
          type="button"
          onClick={props.playNextTrack}
          class={clsx(styles.controlsButton, styles.controlsButtonNext)}
          aria-label="Next"
        >
          <Icon name="player-arrow" />
        </button>
        <div ref={(el) => (volumeContainerRef.current = el)} class={styles.volumeContainer}>
          <Show when={isVolumeBarOpened()}>
            <input
              type="range"
              id="volume"
              min="0"
              max="1"
              value="1"
              step="0.01"
              class={styles.volume}
              onChange={({ target }) => props.onVolumeChange(Number(target.value))}
            />
          </Show>
          <button onClick={toggleVolumeBar} class={styles.volumeButton} role="button" aria-label="Volume">
            <Icon name="volume" />
          </button>
        </div>
      </div>
    </div>
  )
}

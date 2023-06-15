import { createSignal, Show } from 'solid-js'
import { clsx } from 'clsx'

import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'

import { Icon } from '../../_shared/Icon'
import styles from './AudioPlayer.module.scss'

export const PlayerHeader = (props) => {
  let playButtonRef: HTMLButtonElement
  let volumeRef: HTMLInputElement
  const volumeContainerRef: { current: HTMLDivElement } = {
    current: null
  }

  const { getCurrentTrack, onPlayMedia, gainNode, playPrevTrack, playNextTrack } = props

  const [isVolumeBarOpened, setIsVolumeBarOpened] = createSignal(false)

  const handleVolumeChange = () => {
    gainNode.gain.value = Number(volumeRef.value)
  }

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
      <div class={styles.playerTitle}>{getCurrentTrack().title}</div>
      <div class={styles.playerControls}>
        <button
          onClick={onPlayMedia}
          ref={playButtonRef}
          class={clsx(
            styles.playButton,
            getCurrentTrack().isPlaying ? styles.playButtonInvertPause : styles.playButtonInvertPlay
          )}
          role="button"
          aria-label="Play"
          data-playing="false"
        >
          <Icon name={getCurrentTrack().isPlaying ? 'pause' : 'play'} />
        </button>
        <button
          onClick={playPrevTrack}
          ref={playButtonRef}
          class={clsx(styles.controlsButton)}
          role="button"
          aria-label="Previous"
        >
          <Icon name="player-arrow" />
        </button>
        <button
          onClick={playNextTrack}
          ref={playButtonRef}
          class={clsx(styles.controlsButton, styles.controlsButtonNext)}
          role="button"
          aria-label="Next"
        >
          <Icon name="player-arrow" />
        </button>
        <div ref={(el) => (volumeContainerRef.current = el)} class={styles.volumeContainer}>
          <Show when={isVolumeBarOpened()}>
            <input
              ref={volumeRef}
              type="range"
              id="volume"
              min="0"
              max="1"
              value="1"
              step="0.01"
              class={styles.volume}
              onChange={handleVolumeChange}
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

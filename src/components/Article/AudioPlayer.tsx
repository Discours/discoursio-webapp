import { createEffect, createSignal, onMount, For, Show } from 'solid-js'
import { clsx } from 'clsx'

import { SharePopup, getShareUrl } from './SharePopup'
import { getDescription } from '../../utils/meta'
import { Popover } from '../_shared/Popover'
import { Icon } from '../_shared/Icon'

import { useOutsideClickHandler } from '../../utils/useOutsideClickHandler'
import { useLocalize } from '../../context/localize'

import styles from './AudioPlayer.module.scss'

type MediaItem = {
  id?: number
  body: string
  pic: string
  title: string
  url: string
  isCurrent: boolean
  isPlaying: boolean
}

const prepareMedia = (media: MediaItem[]) =>
  media.map((item, index) => ({
    ...item,
    id: index,
    isCurrent: false,
    isPlaying: false
  }))

export default (props: { media: MediaItem[]; articleSlug: string }) => {
  const { t } = useLocalize()

  let audioRef: HTMLAudioElement
  let progressRef: HTMLDivElement
  let volumeRef: HTMLInputElement
  let playButtonRef: HTMLButtonElement
  let timeDurationRef: HTMLSpanElement
  let timeCurrentRef: HTMLSpanElement
  let progressFilledRef: HTMLDivElement
  const volumeContainerRef: { current: HTMLDivElement } = {
    current: null
  }

  const [audioContext, setAudioContext] = createSignal<AudioContext>()
  const [gainNode, setGainNode] = createSignal<GainNode>()

  const [tracks, setTracks] = createSignal<MediaItem[] | null>(prepareMedia(props.media))
  const [duration, setDuration] = createSignal<number>(0)

  const [isVolumeBarOpened, setIsVolumeBarOpened] = createSignal(false)

  const getCurrentTrack = () =>
    tracks().find((track) => track.isCurrent) ||
    (() => {
      setTracks(
        tracks().map((track, index) => ({
          ...track,
          isCurrent: index === 0
        }))
      )

      return tracks()[0]
    })()

  createEffect(() => {
    if (audioRef.src !== getCurrentTrack().url) {
      audioRef.src = getCurrentTrack().url

      audioRef.load()
    }
  })

  createEffect(() => {
    if (timeDurationRef && getCurrentTrack() && duration())
      timeDurationRef.textContent = new Date(duration() * 1000).toISOString().substr(11, 8)
  })

  const setTimes = () => {
    if (timeCurrentRef)
      timeCurrentRef.textContent = new Date(audioRef.currentTime * 1000).toISOString().substr(11, 8)
  }

  const progressUpdate = () => {
    const percent = (audioRef.currentTime / duration()) * 100

    progressFilledRef.style.width = `${percent || 0}%`
  }

  const scrub = (event) => {
    const scrubTime = (event.offsetX / progressRef.offsetWidth) * duration()
    audioRef.currentTime = scrubTime
  }

  const playMedia = async (m: MediaItem) => {
    setTracks(
      tracks().map((track) => ({
        ...track,
        isCurrent: track.id === m.id ? true : false,
        isPlaying: track.id === m.id ? !track.isPlaying : false
      }))
    )

    progressUpdate()

    if (audioContext().state === 'suspended') audioContext().resume()

    if (!getCurrentTrack().isPlaying) {
      audioRef.pause()
    } else {
      await audioRef.play()
    }
  }

  const handleAudioEnd = () => {
    progressFilledRef.style.width = '0%'
    audioRef.currentTime = 0
  }

  const handleAudioTimeUpdate = () => {
    progressUpdate()

    setTimes()
  }

  const handleVolumeChange = () => {
    gainNode().gain.value = Number(volumeRef.value)
  }

  onMount(() => {
    setAudioContext(new AudioContext())
    setGainNode(audioContext().createGain())

    setTimes()

    const track = audioContext().createMediaElementSource(audioRef)
    track.connect(gainNode()).connect(audioContext().destination)
  })

  const toggleVolumeBar = () => {
    setIsVolumeBarOpened(!isVolumeBarOpened())
  }

  useOutsideClickHandler({
    containerRef: volumeContainerRef,
    predicate: () => isVolumeBarOpened(),
    handler: () => toggleVolumeBar()
  })

  const playPrevTrack = (id) => {
    let currIndex = tracks().findIndex((track) => track.id === id)

    if (currIndex !== 0) {
      setTracks(
        tracks().map((track) => ({
          ...track,
          isCurrent: track.id === tracks()[currIndex - 1].id ? true : false,
          isPlaying: track.id === tracks()[currIndex - 1].id ? true : false
        }))
      )
    } else {
      setTracks(
        tracks().map((track) => ({
          ...track,
          isCurrent: track.id === tracks()[tracks().length - 1].id ? true : false,
          isPlaying: track.id === tracks()[tracks().length - 1].id ? true : false
        }))
      )
    }
  }

  const playNextTrack = (id) => {
    let currIndex = tracks().findIndex((track) => track.id === id)
    if (currIndex !== tracks().length - 1) {
      setTracks(
        tracks().map((track) => ({
          ...track,
          isCurrent: track.id === tracks()[currIndex + 1].id ? true : false,
          isPlaying: track.id === tracks()[currIndex + 1].id ? true : false
        }))
      )
    } else {
      setTracks(
        tracks().map((track) => ({
          ...track,
          isCurrent: track.id === tracks()[0].id ? true : false,
          isPlaying: track.id === tracks()[0].id ? true : false
        }))
      )
    }
  }

  const handleOnAudioMetadataLoad = ({ target }) => {
    setDuration(target.duration)
  }

  let mousedown = false

  return (
    <div>
      <Show when={getCurrentTrack()}>
        <div class={styles.playerHeader}>
          <div class={styles.playerTitle}>{getCurrentTrack().title}</div>
          <div class={styles.playerControls}>
            <button
              onClick={() => playMedia(getCurrentTrack())}
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
              onClick={() => playPrevTrack(getCurrentTrack().id)}
              ref={playButtonRef}
              class={clsx(styles.controlsButton)}
              role="button"
              aria-label="Previous"
            >
              <Icon name="player-arrow" />
            </button>
            <button
              onClick={() => playNextTrack(getCurrentTrack().id)}
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
              <button
                onClick={toggleVolumeBar}
                class={styles.volumeButton}
                role="button"
                aria-label="Volume"
              >
                <Icon name="volume" />
              </button>
            </div>
          </div>
        </div>
      </Show>

      <Show when={getCurrentTrack()}>
        <div class={styles.timeline}>
          <div
            class={styles.progress}
            ref={progressRef}
            onClick={scrub}
            onMouseMove={(e) => mousedown && scrub(e)}
            onMouseDown={() => (mousedown = true)}
            onMouseUp={() => (mousedown = false)}
          >
            <div class={styles.progressFilled} ref={progressFilledRef}></div>
          </div>
          <div class={styles.progressTiming}>
            <span ref={timeCurrentRef}>00:00</span>
            <span ref={timeDurationRef}>00:00</span>
          </div>
          <audio
            ref={audioRef}
            onTimeUpdate={handleAudioTimeUpdate}
            onCanPlay={() => {
              if (getCurrentTrack().isPlaying) {
                audioRef.play()
              }
            }}
            onLoadedMetadata={handleOnAudioMetadataLoad}
            onEnded={handleAudioEnd}
            crossorigin="anonymous"
          />
        </div>
      </Show>

      <Show when={tracks()}>
        <ul class={styles.playlist}>
          <For each={tracks()}>
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
                          shareUrl={getShareUrl({ pathname: `/${props.articleSlug}` })}
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

                {/* @@TODO add toggleIsLyricsVisible
                <button
                  onClick={}
                  role="button"
                  aria-label="Play"
                >
                  <Icon name={'lyrics-media'}/>
                </button> */}
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}

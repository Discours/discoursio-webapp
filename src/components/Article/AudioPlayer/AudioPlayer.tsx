import { createEffect, createSignal, onMount, Show } from 'solid-js'

import { PlayerHeader } from './PlayerHeader'
import { PlayerPlaylist } from './PlayerPlaylist'

import styles from './AudioPlayer.module.scss'

export type MediaItem = {
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

const progressUpdate = (audioRef, progressFilledRef, duration) => {
  const percent = (audioRef.currentTime / duration) * 100

  progressFilledRef.style.width = `${percent || 0}%`
}

const scrub = (event, progressRef, duration, audioRef) => {
  const scrubTime = (event.offsetX / progressRef.offsetWidth) * duration
  audioRef.currentTime = scrubTime
}

export default (props: { media: MediaItem[]; articleSlug: string; body: string }) => {
  let audioRef: HTMLAudioElement
  let progressRef: HTMLDivElement
  let timeDurationRef: HTMLSpanElement
  let timeCurrentRef: HTMLSpanElement
  let progressFilledRef: HTMLDivElement

  const [audioContext, setAudioContext] = createSignal<AudioContext>()
  const [gainNode, setGainNode] = createSignal<GainNode>()

  const [tracks, setTracks] = createSignal<MediaItem[] | null>(prepareMedia(props.media))

  const [duration, setDuration] = createSignal<number>(0)
  const [currentTimeContent, setCurrentTimeContent] = createSignal<string>('00:00')
  const [currentDurationContent, setCurrentDurationContent] = createSignal<string>('00:00')

  const [mousedown, setMousedown] = createSignal<boolean>(false)

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
    if (timeDurationRef && getCurrentTrack() && duration()) {
      setCurrentDurationContent(new Date(duration() * 1000).toISOString().slice(14, -5))
    }
  })

  const playMedia = async (m: MediaItem) => {
    setTracks(
      tracks().map((track) => ({
        ...track,
        isCurrent: track.id === m.id ? true : false,
        isPlaying: track.id === m.id ? !track.isPlaying : false
      }))
    )

    progressUpdate(audioRef, progressFilledRef, duration())

    if (audioContext().state === 'suspended') audioContext().resume()

    if (getCurrentTrack().isPlaying) {
      await audioRef.play()
    } else {
      audioRef.pause()
    }
  }

  const setTimes = () => {
    if (timeCurrentRef) {
      setCurrentTimeContent(new Date(audioRef.currentTime * 1000).toISOString().slice(14, -5))
    }
  }

  const handleAudioEnd = () => {
    progressFilledRef.style.width = '0%'
    audioRef.currentTime = 0
  }

  const handleAudioTimeUpdate = () => {
    progressUpdate(audioRef, progressFilledRef, duration())

    setTimes()
  }

  onMount(() => {
    setAudioContext(new AudioContext())
    setGainNode(audioContext().createGain())

    setTimes()

    const track = audioContext().createMediaElementSource(audioRef)
    track.connect(gainNode()).connect(audioContext().destination)
  })

  const playPrevTrack = () => {
    const { id } = getCurrentTrack()
    const currIndex = tracks().findIndex((track) => track.id === id)

    const getUpdatedStatus = (trackId) =>
      currIndex === 0
        ? trackId === tracks()[tracks().length - 1].id
        : trackId === tracks()[currIndex - 1].id

    setTracks(
      tracks().map((track) => ({
        ...track,
        isCurrent: getUpdatedStatus(track.id),
        isPlaying: getUpdatedStatus(track.id)
      }))
    )
  }

  const playNextTrack = () => {
    const { id } = getCurrentTrack()
    const currIndex = tracks().findIndex((track) => track.id === id)

    const getUpdatedStatus = (trackId) =>
      currIndex === tracks().length - 1
        ? trackId === tracks()[0].id
        : trackId === tracks()[currIndex + 1].id

    setTracks(
      tracks().map((track) => ({
        ...track,
        isCurrent: getUpdatedStatus(track.id),
        isPlaying: getUpdatedStatus(track.id)
      }))
    )
  }

  const handleOnAudioMetadataLoad = ({ target }) => {
    setDuration(target.duration)
  }

  return (
    <div>
      <Show when={getCurrentTrack()}>
        <PlayerHeader
          onPlayMedia={() => playMedia(getCurrentTrack())}
          getCurrentTrack={getCurrentTrack}
          playPrevTrack={playPrevTrack}
          playNextTrack={playNextTrack}
          gainNode={gainNode()}
        />
      </Show>

      <Show when={getCurrentTrack()}>
        <div class={styles.timeline}>
          <div
            class={styles.progress}
            ref={progressRef}
            onClick={(e) => scrub(e, progressRef, duration(), audioRef)}
            onMouseMove={(e) => mousedown() && scrub(e, progressRef, duration(), audioRef)}
            onMouseDown={() => setMousedown(true)}
            onMouseUp={() => setMousedown(false)}
          >
            <div class={styles.progressFilled} ref={progressFilledRef}></div>
          </div>
          <div class={styles.progressTiming}>
            <span ref={timeCurrentRef}>{currentTimeContent()}</span>
            <span ref={timeDurationRef}>{currentDurationContent()}</span>
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
        <PlayerPlaylist
          playMedia={playMedia}
          tracks={tracks()}
          getCurrentTrack={getCurrentTrack}
          articleSlug={props.articleSlug}
          body={props.body}
        />
      </Show>
    </div>
  )
}

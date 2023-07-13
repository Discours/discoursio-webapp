import { createEffect, createSignal, onMount, Show } from 'solid-js'
import { PlayerHeader } from './PlayerHeader'
import { PlayerPlaylist } from './PlayerPlaylist'
import styles from './AudioPlayer.module.scss'
import { MediaItem } from '../../../pages/types'

export type Audio = {
  pic?: string
  index?: number
  isCurrent?: boolean
  isPlaying?: boolean
} & MediaItem

type Props = {
  media: Audio[]
  articleSlug?: string
  body?: string
  editorMode?: boolean
  onAudioChange?: (index: number, field: string, value: string) => void
}

const prepareMedia = (media: Audio[]) =>
  media.map((item, index) => ({
    ...item,
    index: index,
    isCurrent: false,
    isPlaying: false
  }))

const progressUpdate = (audioRef, progressFilledRef, duration) => {
  progressFilledRef.current.style.width = `${(audioRef.current.currentTime / duration) * 100 || 0}%`
}

const scrub = (event, progressRef, duration, audioRef) => {
  audioRef.current.currentTime.currentTime =
    (event.current.offsetX / progressRef.current.offsetWidth) * duration
}

const getFormattedTime = (point) => new Date(point * 1000).toISOString().slice(14, -5)

export const AudioPlayer = (props: Props) => {
  const audioRef: { current: HTMLAudioElement } = { current: null }
  const progressRef: { current: HTMLDivElement } = { current: null }
  const progressFilledRef: { current: HTMLDivElement } = { current: null }

  const [audioContext, setAudioContext] = createSignal<AudioContext>()
  const [gainNode, setGainNode] = createSignal<GainNode>()
  const [tracks, setTracks] = createSignal<Audio[] | null>(prepareMedia(props.media))
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
    if (audioRef.current.src !== getCurrentTrack().url) {
      audioRef.current.src = getCurrentTrack().url

      audioRef.current.load()
    }
  })

  createEffect(() => {
    if (getCurrentTrack() && duration()) {
      setCurrentDurationContent(getFormattedTime(duration()))
    }
  })

  const playMedia = async (m: Audio) => {
    setTracks(
      tracks().map((track) => ({
        ...track,
        isCurrent: track.index === m.index,
        isPlaying: track.index === m.index ? !track.isPlaying : false
      }))
    )

    progressUpdate(audioRef, progressFilledRef, duration())

    if (audioContext().state === 'suspended') await audioContext().resume()

    if (getCurrentTrack().isPlaying) {
      await audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }

  const setTimes = () => {
    setCurrentTimeContent(getFormattedTime(audioRef.current.currentTime))
  }

  const handleAudioEnd = () => {
    progressFilledRef.current.style.width = '0%'
    audioRef.current.currentTime = 0
  }

  const handleAudioTimeUpdate = () => {
    progressUpdate(audioRef, progressFilledRef, duration())

    setTimes()
  }

  onMount(() => {
    setAudioContext(new AudioContext())
    setGainNode(audioContext().createGain())

    setTimes()

    const track = audioContext().createMediaElementSource(audioRef.current)
    track.connect(gainNode()).connect(audioContext().destination)
  })

  const playPrevTrack = () => {
    const { index } = getCurrentTrack()
    const currIndex = tracks().findIndex((track) => track.index === index)

    const getUpdatedStatus = (trackId) =>
      currIndex === 0
        ? trackId === tracks()[tracks().length - 1].index
        : trackId === tracks()[currIndex - 1].index

    setTracks(
      tracks().map((track) => ({
        ...track,
        isCurrent: getUpdatedStatus(track.index),
        isPlaying: getUpdatedStatus(track.index)
      }))
    )
  }

  const playNextTrack = () => {
    const { index } = getCurrentTrack()
    const currIndex = tracks().findIndex((track) => track.index === index)

    const getUpdatedStatus = (trackId) =>
      currIndex === tracks().length - 1
        ? trackId === tracks()[0].index
        : trackId === tracks()[currIndex + 1].index

    setTracks(
      tracks().map((track) => ({
        ...track,
        isCurrent: getUpdatedStatus(track.index),
        isPlaying: getUpdatedStatus(track.index)
      }))
    )
  }

  const handleOnAudioMetadataLoad = ({ target }) => {
    setDuration(target.duration)
  }

  const handleAudioDescriptionChange = (index: number, field: string, value) => {
    props.onAudioChange(index, field, value)
    setTracks(
      tracks().map((track, idx) => {
        return idx === index ? { ...track, [field]: value } : track
      })
    )
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
            ref={(el) => (progressRef.current = el)}
            onClick={(e) => scrub(e, progressRef, duration(), audioRef)}
            onMouseMove={(e) => mousedown() && scrub(e, progressRef, duration(), audioRef)}
            onMouseDown={() => setMousedown(true)}
            onMouseUp={() => setMousedown(false)}
          >
            <div class={styles.progressFilled} ref={(el) => (progressFilledRef.current = el)} />
          </div>
          <div class={styles.progressTiming}>
            <span>{currentTimeContent()}</span>
            <span>{currentDurationContent()}</span>
          </div>
          <audio
            ref={(el) => (audioRef.current = el)}
            onTimeUpdate={handleAudioTimeUpdate}
            onCanPlay={() => {
              if (getCurrentTrack().isPlaying) {
                audioRef.current.play()
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
          editorMode={props.editorMode}
          playMedia={playMedia}
          tracks={tracks()}
          currentTrack={getCurrentTrack()}
          articleSlug={props.articleSlug}
          body={props.body}
          onAudioChange={handleAudioDescriptionChange}
        />
      </Show>
    </div>
  )
}

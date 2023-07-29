import { createEffect, createMemo, createSignal, on, onMount, Show } from 'solid-js'
import { PlayerHeader } from './PlayerHeader'
import { PlayerPlaylist } from './PlayerPlaylist'
import styles from './AudioPlayer.module.scss'
import { MediaItem } from '../../../pages/types'
import { imageProxy } from '../../../utils/imageProxy'

type Props = {
  media: MediaItem[]
  articleSlug?: string
  body?: string
  editorMode?: boolean
  onMediaItemFieldChange?: (index: number, field: keyof MediaItem, value: string) => void
  onChangeMediaIndex?: (direction: 'up' | 'down', index) => void
}

const getFormattedTime = (point) => new Date(point * 1000).toISOString().slice(14, -5)

export const AudioPlayer = (props: Props) => {
  const audioRef: { current: HTMLAudioElement } = { current: null }
  const gainNodeRef: { current: GainNode } = { current: null }
  const progressRef: { current: HTMLDivElement } = { current: null }
  const audioContextRef: { current: AudioContext } = { current: null }
  const mouseDownRef: { current: boolean } = { current: false }

  const [currentTrackDuration, setCurrentTrackDuration] = createSignal(0)
  const [currentTime, setCurrentTime] = createSignal(0)
  const [currentTrackIndex, setCurrentTrackIndex] = createSignal<number>(0)
  const [isPlaying, setIsPlaying] = createSignal(false)

  const currentTack = createMemo(() => props.media[currentTrackIndex()])

  createEffect(
    on(
      () => currentTrackIndex(),
      () => {
        setCurrentTrackDuration(0)
      }
    )
  )

  const handlePlayMedia = async (trackIndex: number) => {
    setIsPlaying(!isPlaying() || trackIndex !== currentTrackIndex())
    setCurrentTrackIndex(trackIndex)

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    if (isPlaying()) {
      await audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }

  const handleVolumeChange = (volume: number) => {
    gainNodeRef.current.gain.value = volume
  }

  const handleAudioEnd = () => {
    if (currentTrackIndex() < props.media.length - 1) {
      playNextTrack()
      return
    }

    audioRef.current.currentTime = 0
    setIsPlaying(false)
    setCurrentTrackIndex(0)
  }

  const handleAudioTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime)
  }

  onMount(() => {
    audioContextRef.current = new AudioContext()
    gainNodeRef.current = audioContextRef.current.createGain()

    const track = audioContextRef.current.createMediaElementSource(audioRef.current)
    track.connect(gainNodeRef.current).connect(audioContextRef.current.destination)
  })

  const playPrevTrack = () => {
    let newCurrentTrackIndex = currentTrackIndex() - 1
    if (newCurrentTrackIndex < 0) {
      newCurrentTrackIndex = 0
    }

    setCurrentTrackIndex(newCurrentTrackIndex)
  }

  const playNextTrack = () => {
    let newCurrentTrackIndex = currentTrackIndex() + 1
    if (newCurrentTrackIndex > props.media.length - 1) {
      newCurrentTrackIndex = props.media.length - 1
    }

    setCurrentTrackIndex(newCurrentTrackIndex)
  }

  const handleMediaItemFieldChange = (index: number, field: keyof MediaItem, value) => {
    props.onMediaItemFieldChange(index, field, value)
  }

  const scrub = (event) => {
    audioRef.current.currentTime =
      (event.offsetX / progressRef.current.offsetWidth) * currentTrackDuration()
  }

  return (
    <div>
      <Show when={props.media}>
        <PlayerHeader
          onPlayMedia={() => handlePlayMedia(currentTrackIndex())}
          playPrevTrack={playPrevTrack}
          playNextTrack={playNextTrack}
          onVolumeChange={handleVolumeChange}
          isPlaying={isPlaying()}
          currentTrack={currentTack()}
        />
        <div class={styles.timeline}>
          <div
            class={styles.progress}
            ref={(el) => (progressRef.current = el)}
            onClick={(e) => scrub(e)}
            onMouseMove={(e) => mouseDownRef.current && scrub(e)}
            onMouseDown={() => (mouseDownRef.current = true)}
            onMouseUp={() => (mouseDownRef.current = false)}
          >
            <div
              class={styles.progressFilled}
              style={{
                width: `${(currentTime() / currentTrackDuration()) * 100 || 0}%`
              }}
            />
          </div>
          <div class={styles.progressTiming}>
            <span>{getFormattedTime(currentTime())}</span>
            <Show when={currentTrackDuration() > 0}>
              <span>{getFormattedTime(currentTrackDuration())}</span>
            </Show>
          </div>
          <audio
            ref={(el) => (audioRef.current = el)}
            onTimeUpdate={handleAudioTimeUpdate}
            // TEMP SOLUTION for http/https
            src={currentTack().url.startsWith('https') ? currentTack().url : imageProxy(currentTack().url)}
            onCanPlay={() => {
              // start to play the next track on src change
              if (isPlaying()) {
                audioRef.current.play()
              }
            }}
            onLoadedMetadata={({ currentTarget }) => setCurrentTrackDuration(currentTarget.duration)}
            onEnded={handleAudioEnd}
            crossorigin="anonymous"
          />
        </div>
        <PlayerPlaylist
          editorMode={props.editorMode}
          onPlayMedia={handlePlayMedia}
          onChangeMediaIndex={(direction, index) => props.onChangeMediaIndex(direction, index)}
          isPlaying={isPlaying()}
          media={props.media}
          currentTrackIndex={currentTrackIndex()}
          articleSlug={props.articleSlug}
          body={props.body}
          onMediaItemFieldChange={handleMediaItemFieldChange}
        />
      </Show>
    </div>
  )
}

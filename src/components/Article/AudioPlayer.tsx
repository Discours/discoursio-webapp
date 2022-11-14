import { createEffect, createMemo, createSignal, onMount } from 'solid-js'
import { For } from 'solid-js/web'
import type { Shout } from '../../graphql/types.gen'
import { Soundwave } from './Soundwave'

type MediaItem = any

export default (props: { shout: Shout }) => {
  const media = createMemo<any[]>(() => {
    if (props.shout.media) {
      console.debug(props.shout.media)
      return [...JSON.parse(props.shout.media)]
    }
    return []
  })
  let audioRef: HTMLAudioElement
  const [currentTrack, setCurrentTrack] = createSignal(media()[0])
  const [paused, setPaused] = createSignal(true)
  const togglePlayPause = () => setPaused(!paused())
  const playMedia = (m: MediaItem) => {
    audioRef.src = m.get('src')
    audioRef.play()
  }
  const [audioContext, setAudioContext] = createSignal<AudioContext>()
  onMount(() => setAudioContext(new AudioContext()))
  createEffect(() => (paused() ? audioRef.play : audioRef.pause)())
  return (
    <div class="audio-container">
      <div class="audio-img">
        <img
          class="ligthbox-img lazyload zoom-in"
          width="320"
          height="320"
          alt={props.shout.title}
          title={props.shout.title}
          src={props.shout.cover}
        />
      </div>

      <div class="audio-player-list">
        <div class="player current-track">
          <div class="player-title">{currentTrack().title}</div>
          <i class="fas fa-pause fa-3x fa-fw" onClick={togglePlayPause}></i>
          <div class="player-progress">
            <Soundwave context={audioContext()} url={currentTrack().src} />
            <span class="track-position">{`${audioRef.currentTime} / ${audioRef.duration}`}</span>
          </div>
          <audio ref={audioRef} />
        </div>

        <ul class="all-tracks">
          <For each={media()}>
            {(m: MediaItem) => (
              <li>
                <div class="player-status">
                  <i class="fas fa-play fa-fw" onClick={() => playMedia(m)}></i>
                </div>
                <span class="track-title">{m.title}</span>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  )
}

import { createMemo, createSignal, onMount } from 'solid-js'
import { For } from 'solid-js/web'
import type { Shout } from '../../graphql/types.gen'
import { drawAudio } from '../../utils/soundwave'
type MediaItem = any

export default (props: { shout: Shout }) => {
  const media = createMemo<any[]>(() => {
    if (props.shout.media) {
      console.debug(props.shout.media)
      return [...JSON.parse(props.shout.media)]
    }
    return []
  })
  const [currentTrack, setCurrentTrack] = createSignal(media()[0])
  const [paused, setPaused] = createSignal(true)
  const togglePlayPause = () => setPaused(!paused())
  const playMedia = (m: MediaItem) => {}
  const [audioContext, setAudioContext] = createSignal<AudioContext>()
  const currentTimer = createMemo(() => {
    // TODO: return current audio player track position
    return 1
  })

  onMount(() => {
    const actx = new AudioContext()
    setAudioContext(actx)
    drawAudio(actx, currentTrack().src)
  })

  const SoundWave = () => <canvas></canvas>
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
        <div class="player ng-scope">
          <div class="player-title ng-binding ng-scope">{currentTrack().title}</div>
          <i class="fas fa-pause fa-3x fa-fw ng-scope" onClick={togglePlayPause} style=""></i>
          <div class="player-progress">
            <SoundWave />
            <span class="position ng-binding">{currentTimer() / currentTrack().length}</span>
          </div>
        </div>

        <ul
          class="other-songs ng-scope is-playing"
          ng-class="{ 'is-playing': post._id === $root.currentMusicPostId }"
          style=""
        >
          <For each={media()}>
            {(m: MediaItem) => (
              <li ng-repeat="mediaItem in post.media" class="ng-scope">
                <div class="player-status">
                  <i class="fas fa-play fa-fw ng-scope" onClick={() => playMedia(m)}></i>
                </div>
                <span class="track-title ng-binding">{m.title}</span>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  )
}

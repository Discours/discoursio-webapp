import { createEffect, createMemo, createSignal, createResource, onMount, For, Show } from 'solid-js'
import { clsx } from 'clsx'

import { useOutsideClickHandler } from '../../utils/useOutsideClickHandler'

import { Icon } from '../_shared/Icon'
import styles from './AudioPlayer.module.scss'
import { create } from 'domain'

// @@TODO: add placeholders
// @@TODO: optimize audio loading
// @@TODO: fix currentTime clearing on pause

// @@TODO: add docs
// @@TODO: check crossbrowsing
// @@TODO: refactor functions / api

type MediaItem = {
  id?: number
  body: string
  buffer?: AudioBuffer | null
  pic: string
  title: string
  url: string
  isPlaying: boolean
  duration?: number | 0
}

const drawLineSegment = (ctx: CanvasRenderingContext2D, x, height, width, isEven) => {
  ctx.lineWidth = 1
  ctx.strokeStyle = '#000'
  ctx.beginPath()

  const h = isEven ? height : -height

  ctx.fillRect(x, h, 2, 50)
  ctx.strokeRect(x, h, 2, 50)
}

const visualize = (data, canvas: HTMLCanvasElement) => {
  const dpr = window.devicePixelRatio || 1
  canvas.width = canvas.offsetWidth * dpr
  canvas.height = canvas.offsetHeight * dpr

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.translate(0, canvas.offsetHeight / 2)

  const width = canvas.offsetWidth / data.length

  for (let i = 0; i < data.length; i++) {
    const x = width * i
    let height = data[i] * canvas.offsetHeight

    if (height < 0) {
      height = 0
    } else if (height > canvas.offsetHeight / 2) {
      height = height - canvas.offsetHeight / 2
    }

    drawLineSegment(ctx, x, height, width, (i + 1) % 2)
  }
}

const filterData = (audioBuffer: AudioBuffer) => {
  const rawData = audioBuffer.getChannelData(0)
  const filteredData = []

  const samples = 70
  const blockSize = Math.floor(rawData.length / samples)

  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i
    let sum = 0

    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j])
    }

    filteredData.push(sum / blockSize)
  }

  return filteredData
}

const prepareMedia = (media: MediaItem[]) =>
  media.map((item, index) => ({
    ...item,
    id: index,
    duration: 0,
    buffer: null,
    isPlaying: false
  }))

const normalizeData = (data) => data.map((n) => n * Math.pow(Math.max(...data), -1))

export default (props: { media: MediaItem[] }) => {
  let audioRef: HTMLAudioElement
  let progressRef: HTMLDivElement
  let volumeRef: HTMLInputElement
  let playButtonRef: HTMLButtonElement
  let timeDurationRef: HTMLSpanElement
  let timeCurrentRef: HTMLSpanElement
  let progressFilledRef: HTMLDivElement
  let canvasRef: HTMLCanvasElement
  const volumeContainerRef: { current: HTMLDivElement } = {
    current: null
  }

  const fetchAudioBuffer = async (): Promise<MediaItem[]> => {
    try {
      let res = []

      for (const track of media()) {
        // const [buffer, duration] = await fetch(track.url)
        //   .then((response) => response.arrayBuffer())
        //   .then((arrayBuffer) => audioContext().decodeAudioData(arrayBuffer))
        //   .then((audioBuffer: AudioBuffer) => [
        //     normalizeData(filterData(audioBuffer)),
        //     audioBuffer.duration
        //   ])
        const [buffer, duration] = [[], 123]

        res.push({
          ...track,
          buffer: buffer,
          duration: duration
        })
      }

      return res
    } catch (error) {
      console.error('fetchAudioBuffer error:', error)
      return null
    } finally {
    }
  }

  const media = createMemo(() => prepareMedia(props.media))

  const [audioContext, setAudioContext] = createSignal<AudioContext>()
  const [gainNode, setGainNode] = createSignal<GainNode>()

  const [tracks, { refetch: loadTracks, mutate }] = createResource<MediaItem[]>(fetchAudioBuffer, {
    ssrLoadFrom: 'initial',
    initialValue: null
  })
  const [currentTrack, setCurrentTrack] = createSignal<MediaItem | null>(null)

  createEffect(() => {
    if (tracks() && currentTrack()) {
      if (audioRef) audioRef.src = currentTrack()['url']

      if (canvasRef) visualize(currentTrack().buffer, canvasRef)

      if (currentTrack().isPlaying) audioRef.play()
    }
  })

  const [isVolumeBarOpened, setIsVolumeBarOpened] = createSignal(false)

  const setTimes = () => {
    if (timeCurrentRef)
      timeCurrentRef.textContent = new Date(audioRef.currentTime * 1000).toISOString().substr(11, 8)
  }

  createEffect(() => {
    if (timeDurationRef && currentTrack())
      timeDurationRef.textContent = new Date(currentTrack().duration * 1000).toISOString().substr(11, 8)
  })

  const getCurrentTrack = (id) => {
    if (tracks()) {
      return tracks().find((track) => track.id === id) || null
    }

    return null
  }

  const updateTracks = async (id) => {
    await mutate(
      tracks().map((track) => ({
        ...track,
        isPlaying: track.id === id ? !track.isPlaying : false
      }))
    )

    setCurrentTrack(getCurrentTrack(id))

    if (currentTrack() && canvasRef) {
      visualize(currentTrack().buffer, canvasRef)
    }
  }

  const progressUpdate = () => {
    const percent = (audioRef.currentTime / audioRef.duration) * 100
    progressFilledRef.style.width = `${percent || 0}%`
  }

  let mousedown = false

  const scrub = (event) => {
    const scrubTime = (event.offsetX / progressRef.offsetWidth) * audioRef.duration
    audioRef.currentTime = scrubTime

    audioRef.play()
  }

  const playMedia = (m: MediaItem) => {
    updateTracks(m.id)

    progressUpdate()

    if (audioContext().state === 'suspended') audioContext().resume()
    currentTrack() && currentTrack().isPlaying ? audioRef.pause() : audioRef.play()
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

  onMount(async () => {
    setAudioContext(new AudioContext())
    setGainNode(audioContext().createGain())

    await loadTracks()

    setCurrentTrack(tracks()[0])

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

  const resetTracks = async () => {
    await mutate(
      tracks().map((track) => ({
        ...track,
        isPlaying: false
      }))
    )
  }

  const playPrevTrack = (id) => {
    resetTracks()

    let currIndex = tracks().findIndex((track) => track.id === id)

    if (currIndex !== 0) {
      setCurrentTrack({
        ...tracks()[currIndex - 1],
        isPlaying: true
      })
    } else {
      setCurrentTrack({
        ...tracks()[tracks().length - 1],
        isPlaying: true
      })
    }
  }

  const playNextTrack = (id) => {
    resetTracks()

    let currIndex = tracks().findIndex((track) => track.id === id)

    if (currIndex !== tracks().length - 1) {
      setCurrentTrack({ ...tracks()[currIndex + 1], isPlaying: true })
    } else {
      setCurrentTrack({ ...tracks()[0], isPlaying: true })
    }
  }

  return (
    <div>
      <Show when={currentTrack()} fallback={<div class={styles.playerHeaderPlaceholder}>loading...</div>}>
        <div class={styles.playerHeader}>
          <div class={styles.playerTitle}>{currentTrack().title}</div>
          <div
            class={clsx(styles.playerControls, !currentTrack().buffer ? styles.playerControlsDisabled : '')}
          >
            <button
              onClick={() => playMedia(currentTrack())}
              ref={playButtonRef}
              class={clsx(styles.playButton)}
              role="button"
              aria-label="Play"
              data-playing="false"
            >
              <Icon name={currentTrack().isPlaying ? 'pause' : 'play'} />
            </button>
            <button
              onClick={() => playPrevTrack(currentTrack().id)}
              ref={playButtonRef}
              class={clsx(styles.controlsButton)}
              role="button"
              aria-label="Previous"
            >
              <Icon name="player-arrow" />
            </button>
            <button
              onClick={() => playNextTrack(currentTrack().id)}
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

      <Show when={currentTrack()} fallback={<div class={styles.timelinePlaceholder}>loading...</div>}>
        <div class={styles.timeline}>
          <div
            class={styles.progress}
            ref={progressRef}
            onClick={scrub}
            onMouseMove={(e) => mousedown && scrub(e)}
            onMouseDown={() => (mousedown = true)}
            onMouseUp={() => (mousedown = false)}
          >
            <canvas class={styles.progressCanvas} style="width: 100%; height: 44px" ref={canvasRef} />
            <div class={styles.progressFilled} ref={progressFilledRef}></div>
          </div>
          <div class={styles.progressTiming}>
            <span ref={timeCurrentRef}>00:00</span>
            <span ref={timeDurationRef}>00:00</span>
          </div>
          <audio
            ref={audioRef}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={handleAudioEnd}
            crossorigin="anonymous"
          />
        </div>
      </Show>

      <Show when={tracks()} fallback={<div class={styles.playlistPlaceholder}>loading...</div>}>
        <ul class={styles.playlist}>
          <For each={tracks()}>
            {(m: MediaItem) => {
              return (
                <li
                  class={clsx(
                    styles.playlistItem,
                    currentTrack() && currentTrack().id === m.id ? styles.playlistItemActive : ''
                  )}
                >
                  <button
                    class={styles.playlistItemPlayButton}
                    onClick={() => playMedia(m)}
                    role="button"
                    aria-label="Play"
                  >
                    <Icon
                      name={
                        currentTrack() && currentTrack().id === m.id && currentTrack().isPlaying
                          ? 'pause'
                          : 'play'
                      }
                    />
                  </button>
                  <div class={styles.playlistItemTitle}>{m.title}</div>
                  <div class={styles.playlistItemControls}>controls</div>
                  <span class={styles.playlistItemDuration}>time</span>
                </li>
              )
            }}
          </For>
        </ul>
      </Show>
    </div>
  )
}

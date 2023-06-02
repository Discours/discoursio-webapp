import { clsx } from 'clsx'
import styles from './VideoPlayer.module.scss'
import { createEffect, createSignal, Match, Switch } from 'solid-js'

type Props = {
  class?: string
  videoUrl: string
}

export const VideoPlayer = (props: Props) => {
  const [videoId, setVideoId] = createSignal<string | undefined>()
  const [isVimeo, setIsVimeo] = createSignal(false)

  createEffect(() => {
    const isYoutube = props.videoUrl.includes('youtube.com') || props.videoUrl.includes('youtu.be')
    setIsVimeo(!isYoutube)

    if (isYoutube) {
      const videoIdMatch = props.videoUrl.match(/v=(\w+)/)
      setVideoId(videoIdMatch && videoIdMatch[1])
    } else {
      const videoIdMatch = props.videoUrl.match(/vimeo.com\/(\d+)/)
      setVideoId(videoIdMatch && videoIdMatch[1])
    }
  })

  return (
    <div class={clsx(styles.VideoPlayer, props.class)}>
      <Switch>
        <Match when={isVimeo()}>
          <iframe
            src={`https://player.vimeo.com/video/${videoId()}`}
            width="640"
            height="360"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          />
        </Match>
        <Match when={!isVimeo()}>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId()}`}
            allowfullscreen
          />
        </Match>
      </Switch>
    </div>
  )
}

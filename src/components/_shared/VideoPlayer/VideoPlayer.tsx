import { createEffect, createSignal, Match, Switch, Show } from 'solid-js'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Popover } from '../Popover'
import { clsx } from 'clsx'
import styles from './VideoPlayer.module.scss'
import { useLocalize } from '../../../context/localize'

type Props = {
  videoUrl: string
  title?: string
  description?: string
  class?: string
  onVideoDelete?: () => void
  articleView?: boolean
}

export const VideoPlayer = (props: Props) => {
  const { t } = useLocalize()
  const [videoId, setVideoId] = createSignal<string | undefined>()
  const [isVimeo, setIsVimeo] = createSignal(false)

  createEffect(() => {
    const isYoutube = props.videoUrl.includes('youtube.com') || props.videoUrl.includes('youtu.be')
    setIsVimeo(!isYoutube)
    if (isYoutube) {
      if (props.videoUrl.includes('youtube.com')) {
        const videoIdMatch = props.videoUrl.match(/watch=(\w+)/)
        setVideoId(videoIdMatch && videoIdMatch[1])
      } else {
        const videoIdMatch = props.videoUrl.match(/youtu.be\/(\w+)/)
        setVideoId(videoIdMatch && videoIdMatch[1])
      }
    } else {
      const videoIdMatch = props.videoUrl.match(/vimeo.com\/(\d+)/)
      setVideoId(videoIdMatch && videoIdMatch[1])
    }
  })

  return (
    <div class={clsx(styles.VideoPlayer, props.class, { [styles.articleView]: props.articleView })}>
      <Show when={props.onVideoDelete}>
        <Popover content={t('Delete')}>
          {(triggerRef: (el) => void) => (
            <Button
              ref={triggerRef}
              size="S"
              class={styles.deleteAction}
              onClick={() => props.onVideoDelete()}
              value={<Icon class={styles.deleteIcon} name="delete" />}
            />
          )}
        </Popover>
      </Show>
      <Switch>
        <Match when={isVimeo()}>
          <div class={styles.videoContainer}>
            <iframe
              src={`https://player.vimeo.com/video/${videoId()}`}
              width="640"
              height="360"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            />
          </div>
        </Match>
        <Match when={!isVimeo()}>
          <div class={styles.videoContainer}>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${videoId()}`}
              allowfullscreen
            />
          </div>
        </Match>
      </Switch>
    </div>
  )
}

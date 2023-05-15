import { Show } from 'solid-js'
import styles from './VideoPlayer.module.scss'

export default (props: { url: string }) => (
  <div class={styles.videoContainer}>
    <Show when={props.url.includes('youtube.com')}>
      <iframe
        id="ytplayer"
        width="640"
        height="360"
        src={`https://www.youtube.com/embed/${props.url.split('watch=').pop()}`}
        allowfullscreen
      />
    </Show>
    <Show when={props.url.includes('vimeo.com')}>
      <iframe
        src={'https://player.vimeo.com/video/' + props.url.split('video/').pop()}
        width="420"
        height="345"
        allow="autoplay; fullscreen"
        allowfullscreen
      />
    </Show>
  </div>
)

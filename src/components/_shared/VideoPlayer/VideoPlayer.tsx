import { clsx } from 'clsx'
import styles from './VideoPlayer.module.scss'
import { createEffect, createSignal } from 'solid-js'
import { Button } from '../Button'

type Props = {
  class?: string
  src: string
}

export const VideoPlayer = (props: Props) => {
  const video: { current: HTMLVideoElement } = { current: null }

  return (
    <div class={clsx(styles.VideoPlayer, props.class)}>
      <video
        ref={(el) => (video.current = el)}
        // onClick={playVideo}
        src={props.src}
      />
      {/*<div class={styles.controls}>*/}
      {/*  <Button*/}
      {/*    size="S"*/}
      {/*    onClick={playVideo}*/}
      {/*    value={'Play'}*/}
      {/*  />*/}
      {/*  <Button*/}
      {/*    size="S"*/}
      {/*    onClick={pauseVideo}*/}
      {/*    value={'Pause'}*/}
      {/*  />*/}
      {/*</div>*/}
    </div>
  )
}

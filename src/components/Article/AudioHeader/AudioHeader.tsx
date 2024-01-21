import { clsx } from 'clsx'
import { createSignal, Show } from 'solid-js'

import { Topic } from '../../../graphql/types.gen'
import { MediaItem } from '../../../pages/types'
import { Icon } from '../../_shared/Icon'
import { Image } from '../../_shared/Image'
import { CardTopic } from '../../Feed/CardTopic'

import styles from './AudioHeader.module.scss'

type Props = {
  title: string
  cover?: string
  artistData?: MediaItem
  topic: Topic
}

export const AudioHeader = (props: Props) => {
  const [expandedImage, setExpandedImage] = createSignal(false)
  return (
    <div class={clsx(styles.AudioHeader, { [styles.expandedImage]: expandedImage() })}>
      <div class={styles.cover}>
        <Image class={styles.image} src={props.cover} alt={props.title} width={100} />
        <Show when={props.cover}>
          <button type="button" class={styles.expand} onClick={() => setExpandedImage(!expandedImage())}>
            <Icon name="expand-circle" />
          </button>
        </Show>
      </div>
      <div class={styles.albumInfo}>
        <Show when={props.topic}>
          <CardTopic title={props.topic.title} slug={props.topic.slug} />
        </Show>
        <h1>{props.title}</h1>
        <Show when={props.artistData}>
          <div class={styles.artistData}>
            <Show when={props.artistData?.artist}>
              <div class={styles.item}>{props.artistData.artist}</div>
            </Show>
            <Show when={props.artistData?.date}>
              <div class={styles.item}>{props.artistData.date}</div>
            </Show>
            <Show when={props.artistData?.genre}>
              <div class={styles.item}>{props.artistData.genre}</div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

import { clsx } from 'clsx'
import styles from './AudioHeader.module.scss'
import { imageProxy } from '../../../utils/imageProxy'
import { MediaItem } from '../../../pages/types'
import { createSignal, Show } from 'solid-js'
import { Icon } from '../../_shared/Icon'
import { Topic } from '../../../graphql/types.gen'
import { CardTopic } from '../../Feed/CardTopic'

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
        <img class={styles.image} src={imageProxy(props.cover)} alt={props.title} />
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

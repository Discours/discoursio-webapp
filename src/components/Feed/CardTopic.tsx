import { A } from '@solidjs/router'
import { clsx } from 'clsx'
import styles from './CardTopic.module.scss'

type CardTopicProps = {
  title: string
  slug: string
  isFloorImportant?: boolean
  isFeedMode?: boolean
  class?: string
}

export const CardTopic = (props: CardTopicProps) => {
  return (
    <div
      class={clsx(styles.shoutTopic, props.class, {
        [styles.shoutTopicFloorImportant]: props.isFloorImportant,
        [styles.shoutTopicFeedMode]: props.isFeedMode
      })}
    >
      <A href={`/topic/${props.slug}`}>{props.title}</A>
    </div>
  )
}

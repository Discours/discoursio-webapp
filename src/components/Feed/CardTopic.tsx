import { clsx } from 'clsx'
import { getPagePath } from '@nanostores/router'
import { router } from '../../stores/router'
import styles from './CardTopic.module.scss'

type CardTopicProps = {
  title: string
  slug: string
  isFloorImportant?: boolean
}

export const CardTopic = (props: CardTopicProps) => {
  return (
    <div
      class={clsx(styles.shoutTopic, {
        [styles.shoutTopicFloorImportant]: props.isFloorImportant
      })}
    >
      <a href={getPagePath(router, 'topic', { slug: props.slug })}>{props.title}</a>
    </div>
  )
}

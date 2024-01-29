import { Topic, FollowingEntity } from '../../graphql/schema/core.gen'

import { clsx } from 'clsx'
import { Show } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { FollowButton } from '../_shared/FollowButton'

import styles from './Full.module.scss'

export const FullTopic = (props: { topic: Topic }) => {
  const { t } = useLocalize()
  return (
    <div class={clsx(styles.topicHeader, 'col-md-16 col-lg-12 offset-md-4 offset-lg-6')}>
      <h1>#{props.topic?.title}</h1>
      <p>{props.topic?.body}</p>
      <div class={clsx(styles.topicActions)}>
        <FollowButton slug={props.topic.slug} entity={FollowingEntity.Topic} />
        <a class={styles.write} href={`/create/?topicId=${props.topic?.id}`}>
          {t('Write about the topic')}
        </a>
      </div>
      <Show when={props.topic?.pic}>
        <img src={props.topic.pic} alt={props.topic?.title} />
      </Show>
    </div>
  )
}

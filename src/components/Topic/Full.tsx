import type { Topic } from '../../graphql/schema/core.gen'

import { clsx } from 'clsx'
import { Show, createEffect, createSignal } from 'solid-js'

import { useFollowing } from '../../context/following'
import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'
import { FollowingEntity } from '../../graphql/schema/core.gen'
import { Button } from '../_shared/Button'

import styles from './Full.module.scss'

type Props = {
  topic: Topic
}

export const FullTopic = (props: Props) => {
  const { t } = useLocalize()
  const { subscriptions, setFollowing } = useFollowing()
  const { requireAuthentication } = useSession()
  const [followed, setFollowed] = createSignal()

  createEffect(() => {
    const subs = subscriptions
    if (subs?.topics.length !== 0) {
      const items = subs.topics || []
      setFollowed(items.some((x: Topic) => x?.slug === props.topic?.slug))
    }
  })

  const handleFollowClick = (_ev) => {
    const really = !followed()
    setFollowed(really)
    requireAuthentication(() => {
      setFollowing(FollowingEntity.Topic, props.topic.slug, really)
    }, 'follow')
  }

  return (
    <div class={clsx(styles.topicHeader, 'col-md-16 col-lg-12 offset-md-4 offset-lg-6')}>
      <h1>#{props.topic?.title}</h1>
      <p innerHTML={props.topic?.body}/>
      <div class={clsx(styles.topicActions)}>
        <Button
          variant="primary"
          onClick={handleFollowClick}
          value={followed() ? t('Unfollow the topic') : t('Follow the topic')}
        />
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

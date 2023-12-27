import type { Topic } from '../../graphql/schema/core.gen'

import { clsx } from 'clsx'
import { createMemo, Show } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'
import { FollowingEntity } from '../../graphql/schema/core.gen'
import { follow, unfollow } from '../../stores/zine/common'
import { Button } from '../_shared/Button'

import styles from './Full.module.scss'

type Props = {
  topic: Topic
}

export const FullTopic = (props: Props) => {
  const {
    subscriptions,
    actions: { requireAuthentication, loadSubscriptions },
  } = useSession()

  const { t } = useLocalize()

  const subscribed = createMemo(() =>
    subscriptions().topics.some((topic) => topic.slug === props.topic?.slug),
  )

  const handleSubscribe = (really: boolean) => {
    requireAuthentication(async () => {
      await (really
        ? follow({ what: FollowingEntity.Topic, slug: props.topic.slug })
        : unfollow({ what: FollowingEntity.Topic, slug: props.topic.slug }))
      loadSubscriptions()
    }, 'follow')
  }

  return (
    <div class={clsx(styles.topicHeader, 'col-md-16 col-lg-12 offset-md-4 offset-lg-6')}>
      <h1>#{props.topic?.title}</h1>
      <p>{props.topic?.body}</p>
      <div class={clsx(styles.topicActions)}>
        <Show when={!subscribed()}>
          <Button variant="primary" onClick={() => handleSubscribe(true)} value={t('Follow the topic')} />
        </Show>
        <Show when={subscribed()}>
          <Button
            variant="primary"
            onClick={() => handleSubscribe(false)}
            value={t('Unfollow the topic')}
          />
        </Show>
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

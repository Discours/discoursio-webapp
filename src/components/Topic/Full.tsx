import { createMemo, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { FollowingEntity } from '../../graphql/types.gen'
import styles from './Full.module.scss'
import { follow, unfollow } from '../../stores/zine/common'

import { clsx } from 'clsx'
import { useSession } from '../../context/session'
import { useLocalize } from '../../context/localize'

type Props = {
  topic: Topic
}

export const FullTopic = (props: Props) => {
  const {
    session,
    actions: { requireAuthentication }
  } = useSession()
  const { t } = useLocalize()
  const subscribed = createMemo(() => session()?.news?.topics?.includes(props.topic?.slug))

  const handleSubscribe = (isFollowed: boolean) => {
    if (isFollowed) {
      unfollow({ what: FollowingEntity.Topic, slug: props.topic.slug })
    } else {
      follow({ what: FollowingEntity.Topic, slug: props.topic.slug })
    }
  }

  return (
    <div class={clsx(styles.topicHeader, 'col-md-16 col-lg-12 offset-md-4 offset-lg-6')}>
      <h1>#{props.topic.title}</h1>
      <p>{props.topic.body}</p>
      <div class={clsx(styles.topicActions)}>
        <Show when={!subscribed()}>
          <button
            onClick={() => requireAuthentication(() => handleSubscribe(false), 'follow')}
            class="button"
          >
            {t('Follow the topic')}
          </button>
        </Show>
        <Show when={subscribed()}>
          <button
            onClick={() => requireAuthentication(() => handleSubscribe(true), 'follow')}
            class="button"
          >
            {t('Unfollow the topic')}
          </button>
        </Show>
        <a href={`/create/?topicId=${props.topic.id}`}>{t('Write about the topic')}</a>
      </div>
      <Show when={props.topic.pic}>
        <img src={props.topic.pic} alt={props.topic.title} />
      </Show>
    </div>
  )
}

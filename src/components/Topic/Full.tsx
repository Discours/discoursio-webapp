import { createMemo, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { FollowingEntity } from '../../graphql/types.gen'
import styles from './Full.module.scss'
import { follow, unfollow } from '../../stores/zine/common'
import { t } from '../../utils/intl'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'

type Props = {
  topic: Topic
}

export const FullTopic = (props: Props) => {
  const { session } = useSession()

  const subscribed = createMemo(() => session()?.news?.topics?.includes(props.topic?.slug))
  return (
    <div class={styles.topicFull}>
      <Show when={!!props.topic?.slug}>
        <div class={clsx(styles.topicHeader, 'col-md-8 col-lg-6 offset-md-2 offset-lg-3')}>
          <h1>#{props.topic.title}</h1>
          <p>{props.topic.body}</p>
          <div class={clsx(styles.topicActions)}>
            <Show when={!subscribed()}>
              <button
                onClick={() => follow({ what: FollowingEntity.Topic, slug: props.topic.slug })}
                class="button"
              >
                {t('Follow the topic')}
              </button>
            </Show>
            <Show when={subscribed()}>
              <button
                onClick={() => unfollow({ what: FollowingEntity.Topic, slug: props.topic.slug })}
                class="button"
              >
                {t('Unfollow the topic')}
              </button>
            </Show>
            <a href={`/create/${props.topic.slug}`}>{t('Write about the topic')}</a>
          </div>
          <Show when={props.topic.pic}>
            <img src={props.topic.pic} alt={props.topic.title} />
          </Show>
        </div>
      </Show>
    </div>
  )
}

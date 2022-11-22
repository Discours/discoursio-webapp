import { capitalize } from '../../utils'
import styles from './Card.module.scss'
import { createMemo, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { FollowingEntity } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { follow, unfollow } from '../../stores/zine/common'
import { getLogger } from '../../utils/logger'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'
import { StatMetrics } from '../_shared/StatMetrics'

const log = getLogger('TopicCard')

interface TopicProps {
  topic: Topic
  compact?: boolean
  subscribed?: boolean
  shortDescription?: boolean
  subscribeButtonBottom?: boolean
  additionalClass?: string
  isTopicInRow?: boolean
  iconButton?: boolean
  showPublications?: boolean
}

export const TopicCard = (props: TopicProps) => {
  const { session } = useSession()

  const subscribed = createMemo(() => {
    if (!session()?.user?.slug || !session()?.news?.topics) {
      return false
    }

    return session()?.news.topics.includes(props.topic.slug)
  })

  // FIXME use store actions
  const subscribe = async (really = true) => {
    if (really) {
      follow({ what: FollowingEntity.Topic, slug: props.topic.slug })
    } else {
      unfollow({ what: FollowingEntity.Topic, slug: props.topic.slug })
    }
  }
  return (
    <div
      class={styles.topic}
      classList={{
        row: !props.compact && !props.subscribeButtonBottom,
        [styles.topicCompact]: props.compact,
        [styles.topicInRow]: props.isTopicInRow
      }}
    >
      <div classList={{ 'col-md-9 col-lg-7 col-xl-6': !props.compact && !props.subscribeButtonBottom }}>
        <Show when={props.topic.title}>
          <h3 class={styles.topicTitle}>
            <a href={`/topic/${props.topic.slug}`}>{capitalize(props.topic.title || '')}</a>
          </h3>
        </Show>
        <Show when={props.topic.pic}>
          <div class={styles.topicAvatar}>
            <a href={`/topic/${props.topic.slug}`}>
              <img src={props.topic.pic} alt={props.topic.title} />
            </a>
          </div>
        </Show>

        <Show when={!props.compact && props.topic?.body}>
          <div
            class={clsx(styles.topicDescription, 'text-truncate')}
            classList={{ 'topic-description--short': props.shortDescription }}
          >
            {props.topic.body}
          </div>
        </Show>
      </div>
      <div
        class={styles.controlContainer}
        classList={{ 'col-md-3': !props.compact && !props.subscribeButtonBottom }}
      >
        <Show
          when={subscribed()}
          fallback={
            <button
              onClick={() => subscribe(true)}
              class="button--light button--subscribe-topic"
              classList={{
                [styles.buttonCompact]: props.compact
              }}
            >
              <Show when={props.iconButton}>+</Show>
              <Show when={!props.iconButton}>{t('Follow')}</Show>
            </button>
          }
        >
          <button
            onClick={() => subscribe(false)}
            class="button--light button--subscribe-topic"
            classList={{
              [styles.buttonCompact]: props.compact
            }}
          >
            <Show when={props.iconButton}>-</Show>
            <Show when={!props.iconButton}>{t('Unfollow')}</Show>
          </button>
        </Show>
      </div>
    </div>
  )
}

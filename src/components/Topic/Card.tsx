import { capitalize } from '../../utils'
import styles from './Card.module.scss'
import { createMemo, createSignal, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { FollowingEntity } from '../../graphql/types.gen'

import { follow, unfollow } from '../../stores/zine/common'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'
import { Icon } from '../_shared/Icon'
import { useLocalize } from '../../context/localize'

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
  showDescription?: boolean
}

export const TopicCard = (props: TopicProps) => {
  const { t } = useLocalize()
  const {
    session,
    isSessionLoaded,
    isAuthenticated,
    actions: { loadSession, callAuthenticationModal }
  } = useSession()

  const [isSubscribing, setIsSubscribing] = createSignal(false)

  const subscribed = createMemo(() => {
    if (!session()?.user?.slug || !session()?.news?.topics) {
      return false
    }

    return session()?.news.topics.includes(props.topic.slug)
  })

  const subscribe = async (really = true) => {
    setIsSubscribing(true)

    await (really
      ? follow({ what: FollowingEntity.Topic, slug: props.topic.slug })
      : unfollow({ what: FollowingEntity.Topic, slug: props.topic.slug }))

    await loadSession()
    setIsSubscribing(false)
  }

  const handleSubscribe = () => {
    if (!isAuthenticated()) {
      callAuthenticationModal()
    } else {
      subscribe(!subscribed())
    }
  }

  return (
    <div
      class={styles.topic}
      classList={{
        row: !props.subscribeButtonBottom,
        [styles.topicCompact]: props.compact,
        [styles.topicInRow]: props.isTopicInRow
      }}
    >
      <div classList={{ 'col-sm-18 col-lg-14 col-xl-12': !props.subscribeButtonBottom }}>
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

        <Show when={props.showDescription && props.topic?.body}>
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
        classList={{ 'col-sm-6 col-lg-10 col-xl-12': !props.subscribeButtonBottom }}
      >
        <ShowOnlyOnClient>
          <Show when={isSessionLoaded()}>
            <button
              onClick={handleSubscribe}
              class="button--light button--subscribe-topic"
              classList={{
                [styles.buttonCompact]: props.compact,
                [styles.isSubscribing]: isSubscribing(),
                [styles.isSubscribed]: subscribed()
              }}
              disabled={isSubscribing()}
            >
              <Show when={props.iconButton}>
                <Show when={subscribed()} fallback="+">
                  <Icon name="check-subscribed" />
                </Show>
              </Show>
              <Show when={!props.iconButton}>
                <Show when={subscribed()} fallback={t('Follow')}>
                  {t('Unfollow')}
                </Show>
              </Show>
            </button>
          </Show>
        </ShowOnlyOnClient>
      </div>
    </div>
  )
}

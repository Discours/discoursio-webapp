import { clsx } from 'clsx'
import styles from './TopicBadge.module.scss'
import { FollowingEntity, Topic } from '../../../graphql/types.gen'
import { createMemo, createSignal, Show } from 'solid-js'
import { imageProxy } from '../../../utils/imageProxy'
import { capitalize } from '../../../utils'
import { Button } from '../../_shared/Button'
import { useSession } from '../../../context/session'
import { useLocalize } from '../../../context/localize'
import { follow, unfollow } from '../../../stores/zine/common'
import { CheckButton } from '../../_shared/CheckButton'

type Props = {
  topic: Topic
  minimizeSubscribeButton?: boolean
}

export const TopicBadge = (props: Props) => {
  const [isSubscribing, setIsSubscribing] = createSignal(false)
  const { t } = useLocalize()
  const {
    isAuthenticated,
    session,
    actions: { loadSession }
  } = useSession()

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

  return (
    <div class={styles.TopicBadge}>
      <a
        href={`/topic/${props.topic.slug}`}
        class={clsx(styles.picture, { [styles.withImage]: props.topic.pic })}
        style={props.topic.pic && { 'background-image': `url('${imageProxy(props.topic.pic)}')` }}
      />
      <a href={`/topic/${props.topic.slug}`} class={styles.info}>
        <span class={styles.title}>{props.topic.title}</span>
        <Show
          when={props.topic.body}
          fallback={
            <div class={styles.description}>
              {t('PublicationsWithCount', { count: props.topic.stat.shouts ?? 0 })}
            </div>
          }
        >
          <div class={clsx('text-truncate', styles.description)}>{props.topic.body}</div>
        </Show>
      </a>
      <Show when={isAuthenticated()}>
        <div class={styles.actions}>
          <Show
            when={!props.minimizeSubscribeButton}
            fallback={
              <CheckButton
                text={t('Follow')}
                checked={subscribed()}
                onClick={() => subscribe(!subscribed)}
              />
            }
          >
            <Show
              when={subscribed()}
              fallback={
                <Button
                  variant="primary"
                  size="S"
                  value={isSubscribing() ? t('...subscribing') : t('Subscribe')}
                  onClick={() => subscribe(true)}
                  class={styles.subscribeButton}
                />
              }
            >
              <Button
                onClick={() => subscribe(false)}
                variant="bordered"
                size="S"
                value={t('You are subscribed')}
                class={styles.subscribeButton}
              />
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  )
}

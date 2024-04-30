import { clsx } from 'clsx'
import { Show, createEffect, createSignal, on } from 'solid-js'

import { useFollowing } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { useMediaQuery } from '../../../context/mediaQuery'
import { useSession } from '../../../context/session'
import { FollowingEntity, Topic } from '../../../graphql/schema/core.gen'
import { capitalize } from '../../../utils/capitalize'
import { getImageUrl } from '../../../utils/getImageUrl'
import { BadgeSubscribeButton } from '../../_shared/BadgeSubscribeButton'
import styles from './TopicBadge.module.scss'

type Props = {
  topic: Topic
  minimizeSubscribeButton?: boolean
  showStat?: boolean
  subscriptionsMode?: boolean
}

export const TopicBadge = (props: Props) => {
  const { t, lang } = useLocalize()
  const { mediaMatches } = useMediaQuery()
  const [isMobileView, setIsMobileView] = createSignal(false)
  const { requireAuthentication } = useSession()
  const [isSubscribed, setIsSubscribed] = createSignal<boolean>()
  const { follow, unfollow, subscriptions, subscribeInAction } = useFollowing()

  createEffect(() => {
    if (!subscriptions || !props.topic) return
    const subscribed = subscriptions.topics?.some((topics) => topics.id === props.topic?.id)
    setIsSubscribed(subscribed)
  })

  const handleFollowClick = () => {
    requireAuthentication(() => {
      isSubscribed()
        ? follow(FollowingEntity.Topic, props.topic.slug)
        : unfollow(FollowingEntity.Topic, props.topic.slug)
    }, 'subscribe')
  }

  createEffect(() => {
    setIsMobileView(!mediaMatches.sm)
  })

  const title = () =>
    lang() === 'en' ? capitalize(props.topic.slug.replaceAll('-', ' ')) : props.topic.title

  return (
    <div class={clsx(styles.TopicBadge, { [styles.TopicBadgeSubscriptionsMode]: props.subscriptionsMode })}>
      <div class={styles.content}>
        <div class={styles.basicInfo}>
          <Show when={props.subscriptionsMode}>
            <a
              href={`/topic/${props.topic.slug}`}
              class={clsx(styles.picture, {
                [styles.withImage]: props.topic.pic,
                [styles.smallSize]: isMobileView(),
              })}
              style={
                props.topic.pic && {
                  'background-image': `url('${getImageUrl(props.topic.pic, { width: 40, height: 40 })}')`,
                }
              }
            />
          </Show>

          <a href={`/topic/${props.topic.slug}`} class={styles.info}>
            <span class={styles.title}>{title()}</span>

            <Show
              when={props.topic.body}
              fallback={
                <div class={styles.description}>
                  {t('PublicationsWithCount', { count: props.topic?.stat?.shouts ?? 0 })}
                </div>
              }
            >
              <div innerHTML={props.topic.body} class={clsx('text-truncate', styles.description)} />
            </Show>
          </a>
        </div>
        <div class={styles.actions}>
          <BadgeSubscribeButton
            isSubscribed={isSubscribed()}
            action={handleFollowClick}
            actionMessageType={
              subscribeInAction()?.slug === props.topic.slug ? subscribeInAction().type : undefined
            }
          />
        </div>
      </div>

      <Show when={!props.subscriptionsMode}>
        <div class={styles.stats}>
          <span class={styles.statsItem}>{t('shoutsWithCount', { count: props.topic?.stat?.shouts })}</span>
          <span class={styles.statsItem}>
            {t('authorsWithCount', { count: props.topic?.stat?.authors })}
          </span>
          <span class={styles.statsItem}>
            {t('FollowersWithCount', { count: props.topic?.stat?.followers })}
          </span>
          <Show when={props.topic?.stat?.comments}>
            <span class={styles.statsItem}>
              {t('CommentsWithCount', { count: props.topic?.stat?.comments ?? 0 })}
            </span>
          </Show>
        </div>
      </Show>
    </div>
  )
}

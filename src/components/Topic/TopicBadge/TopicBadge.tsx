import { clsx } from 'clsx'
import { createEffect, createSignal, Show } from 'solid-js'

import { useFollowing } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { useMediaQuery } from '../../../context/mediaQuery'
import { useSession } from '../../../context/session'
import { FollowingEntity, Topic } from '../../../graphql/schema/core.gen'
import { capitalize } from '../../../utils/capitalize'
import { getImageUrl } from '../../../utils/getImageUrl'
import { Button } from '../../_shared/Button'
import { CheckButton } from '../../_shared/CheckButton'

import styles from './TopicBadge.module.scss'

type Props = {
  topic: Topic
  minimizeSubscribeButton?: boolean
}

export const TopicBadge = (props: Props) => {
  const { t, lang } = useLocalize()
  const { mediaMatches } = useMediaQuery()
  const [isMobileView, setIsMobileView] = createSignal(false)
  const {
    actions: { requireAuthentication },
  } = useSession()
  const { setFollowing, loading: subLoading } = useFollowing()
  const [followed, setFollowed] = createSignal()

  const handleFollowClick = () => {
    const value = !followed()
    requireAuthentication(() => {
      setFollowed(value)
      setFollowing(FollowingEntity.Topic, props.topic.slug, value)
    }, 'subscribe')
  }

  createEffect(() => {
    setIsMobileView(!mediaMatches.sm)
  })

  const title = () =>
    lang() === 'en' ? capitalize(props.topic.slug.replaceAll('-', ' ')) : props.topic.title

  return (
    <div class={styles.TopicBadge}>
      <div class={styles.basicInfo}>
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
        <a href={`/topic/${props.topic.slug}`} class={styles.info}>
          <span class={styles.title}>{title()}</span>
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
      </div>

      <div class={styles.actions}>
        <Show
          when={!props.minimizeSubscribeButton}
          fallback={
            <CheckButton text={t('Follow')} checked={Boolean(followed())} onClick={handleFollowClick} />
          }
        >
          <Show
            when={followed()}
            fallback={
              <Button
                variant="primary"
                size="S"
                value={subLoading() ? t('subscribing...') : t('Subscribe')}
                onClick={handleFollowClick}
                class={styles.subscribeButton}
              />
            }
          >
            <Button
              onClick={handleFollowClick}
              variant="bordered"
              size="S"
              value={t('Following')}
              class={styles.subscribeButton}
            />
          </Show>
        </Show>
      </div>
    </div>
  )
}

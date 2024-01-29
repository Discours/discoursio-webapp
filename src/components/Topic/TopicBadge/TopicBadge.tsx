import { clsx } from 'clsx'
import { createEffect, createSignal, Show } from 'solid-js'

import { FollowingEntity, Topic } from '../../../graphql/schema/core.gen'
import { useLocalize } from '../../../context/localize'
import { useMediaQuery } from '../../../context/mediaQuery'
import { capitalize } from '../../../utils/capitalize'
import { getImageUrl } from '../../../utils/getImageUrl'
import { FollowButton } from '../../_shared/FollowButton'

import styles from './TopicBadge.module.scss'

type Props = {
  topic: Topic
  minimizeSubscribeButton?: boolean
}

export const TopicBadge = (props: Props) => {
  const { t, lang } = useLocalize()
  const { mediaMatches } = useMediaQuery()
  const [isMobileView, setIsMobileView] = createSignal(false)
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
        <FollowButton
          slug={props.topic.slug}
          entity={FollowingEntity.Topic}
          minimizeSubscribeButton={props.minimizeSubscribeButton}
        />
      </div>
    </div>
  )
}

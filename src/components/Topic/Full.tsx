import type { Author, Topic } from '~/graphql/schema/core.gen'

import { clsx } from 'clsx'
import { Show, createEffect, createSignal, on } from 'solid-js'

import { useFollowing } from '~/context/following'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { FollowingEntity } from '~/graphql/schema/core.gen'
import { Button } from '../_shared/Button'

import { capitalize } from '~/utils/capitalize'
import { FollowingCounters } from '../_shared/FollowingCounters/FollowingCounters'
import { Icon } from '../_shared/Icon'
import styles from './Full.module.scss'

type Props = {
  topic: Topic
  followers?: Author[]
  authors?: Author[]
}

export const FullTopic = (props: Props) => {
  const { t, lang } = useLocalize()
  const { follows, changeFollowing } = useFollowing()
  const { requireAuthentication } = useSession()
  const [followed, setFollowed] = createSignal()
  const [title, setTitle] = createSignal('')

  createEffect(
    on(
      () => props.topic,
      (tpc) => {
        if (!tpc) return
        /* FIXME: use title translation*/
        setTitle((_) => tpc?.title || '')
        return `#${capitalize(
          lang() === 'en' ? tpc.slug.replaceAll('-', ' ') : tpc.title || tpc.slug.replaceAll('-', ' '),
          true
        )}`
      },
      {}
    )
  )

  createEffect(() => {
    if (follows?.topics?.length ?? true) {
      const items = follows.topics || []
      setFollowed(items.some((x: Topic) => x?.slug === props.topic?.slug))
    }
  })

  const handleFollowClick = (_ev?: MouseEvent | undefined) => {
    const really = !followed()
    setFollowed(really)
    requireAuthentication(() => {
      changeFollowing(FollowingEntity.Topic, props.topic.slug, really)
    }, 'follow')
  }

  return (
    <div class={clsx(styles.topicHeader, 'col-md-16 col-lg-12 offset-md-4 offset-lg-6')}>
      <h1>{title()}</h1>
      <p class={styles.topicDescription} innerHTML={props.topic?.body || ''} />

      <div class={styles.topicDetails}>
        <Show when={props.topic?.stat}>
          <div class={styles.topicDetailsItem}>
            <Icon name="feed-all" class={styles.topicDetailsIcon} />
            {t('some posts', {
              count: props.topic?.stat?.shouts ?? 0
            })}
          </div>
        </Show>

        <FollowingCounters
          followers={props.followers}
          followersAmount={props.topic?.stat?.followers}
          authors={props.authors}
          authorsAmount={props.topic?.stat?.authors || props.authors?.length || 0}
        />
      </div>

      <div class={clsx(styles.topicActions)}>
        <Button
          variant="primary"
          onClick={handleFollowClick}
          value={followed() ? t('Unfollow the topic') : t('Follow the topic')}
          class={styles.followControl}
        />
        <a class={styles.writeControl} href={`/edit/new/?topicId=${props.topic?.id}`}>
          {t('Write about the topic')}
        </a>
      </div>
      <Show when={props.topic?.pic}>
        <img src={props.topic?.pic || ''} alt={props.topic?.title || ''} />
      </Show>
    </div>
  )
}

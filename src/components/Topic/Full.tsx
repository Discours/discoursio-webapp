import type { Author, Topic } from '../../graphql/schema/core.gen'

import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal } from 'solid-js'

import { useFollowing } from '../../context/following'
import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'
import { FollowingEntity } from '../../graphql/schema/core.gen'
import { Button } from '../_shared/Button'

import stylesCard from '../Author/AuthorCard/AuthorCard.module.scss'
import { Userpic } from '../Author/Userpic'
import styles from './Full.module.scss'

type Props = {
  topic: Topic
  followers?: Author[]
}

export const FullTopic = (props: Props) => {
  const { t } = useLocalize()
  const { subscriptions, setFollowing } = useFollowing()
  const { requireAuthentication } = useSession()
  const [followed, setFollowed] = createSignal()

  createEffect(() => {
    const subs = subscriptions
    if (subs?.topics.length !== 0) {
      const items = subs.topics || []
      setFollowed(items.some((x: Topic) => x?.slug === props.topic?.slug))
    }
  })

  const handleFollowClick = (_ev) => {
    const really = !followed()
    setFollowed(really)
    requireAuthentication(() => {
      setFollowing(FollowingEntity.Topic, props.topic.slug, really)
    }, 'follow')
  }

  return (
    <div class={clsx(styles.topicHeader, 'col-md-16 col-lg-12 offset-md-4 offset-lg-6')}>
      <h1>#{props.topic?.title}</h1>

      <div class={stylesCard.subscribersContainer}>
        <Show when={props.followers && props.followers.length > 0}>
          <a href="?m=followers" class={stylesCard.subscribers}>
            <For each={props.followers.slice(0, 3)}>
              {(f) => (
                <Userpic size={'XS'} name={f.name} userpic={f.pic} class={stylesCard.subscribersItem} />
              )}
            </For>
            <div class={stylesCard.subscribersCounter}>
              {t('SubscriberWithCount', {
                count: props.followers.length ?? 0,
              })}
            </div>
          </a>
        </Show>
        <Show when={props.topic?.stat?.shouts}>
          <div class={stylesCard.subscribersCounter}>
            {t('PublicationsWithCount', {
              count: props.topic?.stat?.shouts ?? 0,
            })}
          </div>
        </Show>
      </div>

      <p innerHTML={props.topic?.body} />
      <div class={clsx(styles.topicActions)}>
        <Button
          variant="primary"
          onClick={handleFollowClick}
          value={followed() ? t('Unfollow the topic') : t('Follow the topic')}
        />
        <a class={styles.write} href={`/create/?topicId=${props.topic?.id}`}>
          {t('Write about the topic')}
        </a>
      </div>
      <Show when={props.topic?.pic}>
        <img src={props.topic?.pic} alt={props.topic?.title} />
      </Show>
    </div>
  )
}

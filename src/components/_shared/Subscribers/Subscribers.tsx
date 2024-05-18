import { For, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'

import { Author, Topic } from '../../../graphql/schema/core.gen'
import { Userpic } from '../../Author/Userpic'

import styles from './Subscribers.module.scss'

type Props = {
  followers?: Author[]
  followersAmount?: number
  following?: Array<Author | Topic>
  followingAmount?: number
}

export const Subscribers = (props: Props) => {
  const { t } = useLocalize()

  return (
    <div class={styles.subscribersContainer}>
      <a href="?m=followers" class={styles.subscribers}>
        <Show when={props.followers && props.followers.length > 0}>
          <For each={props.followers.slice(0, 3)}>
            {(f) => <Userpic size={'XS'} name={f.name} userpic={f.pic} class={styles.subscribersItem} />}
          </For>
        </Show>
        <div class={styles.subscribersCounter}>
          {t('SubscriberWithCount', {
            count: props.followersAmount || props.followers.length || 0,
          })}
        </div>
      </a>

      <a href="?m=following" class={styles.subscribers}>
        <Show when={props.following && props.following.length > 0}>
          <For each={props.following.slice(0, 3)}>
            {(f) => {
              if ('name' in f) {
                return <Userpic size={'XS'} name={f.name} userpic={f.pic} class={styles.subscribersItem} />
              }

              if ('title' in f) {
                return <Userpic size={'XS'} name={f.title} userpic={f.pic} class={styles.subscribersItem} />
              }

              return null
            }}
          </For>
        </Show>
        <div class={styles.subscribersCounter}>
          {t('SubscriptionWithCount', {
            count: props.followingAmount || props.following?.length || 0,
          })}
        </div>
      </a>
    </div>
  )
}

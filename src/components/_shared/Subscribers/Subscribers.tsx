import { For, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'

import { Author, Topic } from '../../../graphql/schema/core.gen'
import { Userpic } from '../../Author/Userpic'

import styles from './Subscribers.module.scss'

type Props = {
  followers: Author[]
  following?: Array<Author | Topic>
}

export const Subscribers = (props: Props) => {
  const { t } = useLocalize()

  return (
    <div class={styles.subscribersContainer}>
      <Show when={props.followers && props.followers.length > 0}>
        <a href="?m=followers" class={styles.subscribers}>
          <For each={props.followers.slice(0, 3)}>
            {(f) => <Userpic size={'XS'} name={f.name} userpic={f.pic} class={styles.subscribersItem} />}
          </For>
          <div class={styles.subscribersCounter}>
            {t('SubscriberWithCount', {
              count: props.followers.length ?? 0,
            })}
          </div>
        </a>
      </Show>

      <Show when={props.following && props.following.length > 0}>
        <a href="?m=following" class={styles.subscribers}>
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
          <div class={styles.subscribersCounter}>
            {t('SubscriptionWithCount', {
              count: props?.following.length ?? 0,
            })}
          </div>
        </a>
      </Show>
    </div>
  )
}

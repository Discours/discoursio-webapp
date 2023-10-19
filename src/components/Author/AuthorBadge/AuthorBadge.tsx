import { clsx } from 'clsx'
import styles from './AuthorBadge.module.scss'
import { Userpic } from '../Userpic'
import { Author, FollowingEntity } from '../../../graphql/types.gen'
import { createMemo, createSignal, Match, Show, Switch } from 'solid-js'
import { useLocalize } from '../../../context/localize'
import { Button } from '../../_shared/Button'
import { useSession } from '../../../context/session'
import { follow, unfollow } from '../../../stores/zine/common'
import { CheckButton } from '../../_shared/CheckButton'

type Props = {
  author: Author
  minimizeSubscribeButton?: boolean
}
export const AuthorBadge = (props: Props) => {
  const [isSubscribing, setIsSubscribing] = createSignal(false)
  const {
    session,
    subscriptions,
    actions: { loadSubscriptions, requireAuthentication }
  } = useSession()

  const { t, formatDate } = useLocalize()
  const subscribed = createMemo(() =>
    subscriptions().authors.some((author) => author.slug === props.author.slug)
  )

  const subscribe = async (really = true) => {
    setIsSubscribing(true)

    await (really
      ? follow({ what: FollowingEntity.Author, slug: props.author.slug })
      : unfollow({ what: FollowingEntity.Author, slug: props.author.slug }))

    await loadSubscriptions()
    setIsSubscribing(false)
  }
  const handleSubscribe = (really: boolean) => {
    requireAuthentication(() => {
      subscribe(really)
    }, 'subscribe')
  }

  return (
    <div class={clsx(styles.AuthorBadge)}>
      <Userpic
        hasLink={true}
        isMedium={true}
        name={props.author.name}
        userpic={props.author.userpic}
        slug={props.author.slug}
      />
      <a href={`/author/${props.author.slug}`} class={styles.info}>
        <div class={styles.name}>{props.author.name}</div>
        <Switch
          fallback={
            <div class={styles.bio}>
              {t('Registered since {date}', { date: formatDate(new Date(props.author.createdAt)) })}
            </div>
          }
        >
          <Match when={props.author.bio}>
            <div class={clsx('text-truncate', styles.bio)} innerHTML={props.author.bio} />
          </Match>
          <Match when={props.author?.stat && props.author?.stat.shouts > 0}>
            <div class={styles.bio}>
              {t('PublicationsWithCount', { count: props.author.stat?.shouts ?? 0 })}
            </div>
          </Match>
        </Switch>
      </a>
      <Show when={props.author.slug !== session()?.user.slug}>
        <div class={styles.actions}>
          <Show
            when={!props.minimizeSubscribeButton}
            fallback={
              <CheckButton
                text={t('Follow')}
                checked={subscribed()}
                onClick={() => handleSubscribe(!subscribed())}
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
                  onClick={() => handleSubscribe(true)}
                  class={styles.subscribeButton}
                />
              }
            >
              <Button
                variant="bordered"
                size="S"
                value={t('Following')}
                onClick={() => handleSubscribe(false)}
                class={styles.subscribeButton}
              />
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  )
}

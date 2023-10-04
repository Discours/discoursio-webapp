import { clsx } from 'clsx'
import styles from './AuthorBadge.module.scss'
import { Userpic } from '../Userpic'
import { Author, FollowingEntity } from '../../../graphql/types.gen'
import { createMemo, createSignal, Show } from 'solid-js'
import { formatDate } from '../../../utils'
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
    isAuthenticated,
    session,
    actions: { loadSession }
  } = useSession()

  const { t } = useLocalize()
  const subscribed = createMemo<boolean>(() => {
    return session()?.news?.authors?.some((u) => u === props.author.slug) || false
  })

  const subscribe = async (really = true) => {
    setIsSubscribing(true)

    await (really
      ? follow({ what: FollowingEntity.Author, slug: props.author.slug })
      : unfollow({ what: FollowingEntity.Author, slug: props.author.slug }))

    await loadSession()
    setIsSubscribing(false)
  }

  return (
    <div class={clsx(styles.AuthorBadge)}>
      <Userpic hasLink={true} isMedium={true} name={props.author.name} userpic={props.author.userpic} />
      <a href={`/author/${props.author.slug}`} class={styles.info}>
        <div class={styles.name}>{props.author.name}</div>
        <Show
          when={props.author.bio}
          fallback={
            <div class={styles.bio}>
              {t('Registered since {{date}}', { date: formatDate(new Date(props.author.createdAt)) })}
            </div>
          }
        >
          <div class={clsx('text-truncate', styles.bio)}>{props.author.bio}</div>
        </Show>
      </a>
      <Show when={isAuthenticated() && props.author.slug !== session().user.slug}>
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
                />
              }
            >
              <Button
                onClick={() => subscribe(false)}
                variant="secondary"
                size="S"
                value={t('You are subscribed')}
              />
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  )
}
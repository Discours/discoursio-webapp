import { clsx } from 'clsx'
import styles from './AuthorBadge.module.scss'
import stylesButton from '../../_shared/Button/Button.module.scss'
import { Userpic } from '../Userpic'
import { Author, FollowingEntity } from '../../../graphql/types.gen'
import { createMemo, createSignal, Match, Show, Switch } from 'solid-js'
import { useLocalize } from '../../../context/localize'
import { Button } from '../../_shared/Button'
import { useSession } from '../../../context/session'
import { follow, unfollow } from '../../../stores/zine/common'
import { CheckButton } from '../../_shared/CheckButton'
import { openPage } from '@nanostores/router'
import { router, useRouter } from '../../../stores/router'
import { Icon } from '../../_shared/Icon'

type Props = {
  author: Author
  minimizeSubscribeButton?: boolean
  showMessageButton?: boolean
  iconButtons?: boolean
  nameOnly?: boolean
}
export const AuthorBadge = (props: Props) => {
  const [isSubscribing, setIsSubscribing] = createSignal(false)
  const {
    session,
    subscriptions,
    actions: { loadSubscriptions, requireAuthentication }
  } = useSession()
  const { changeSearchParam } = useRouter()
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

  const initChat = () => {
    requireAuthentication(() => {
      openPage(router, `inbox`)
      changeSearchParam({
        initChat: props.author.id.toString()
      })
    }, 'discussions')
  }
  const subscribeValue = createMemo(() => {
    if (props.iconButtons) {
      return <Icon name="author-subscribe" class={stylesButton.icon} />
    }
    return isSubscribing() ? t('subscribing...') : t('Subscribe')
  })

  const unsubscribeValue = () => {}

  return (
    <div class={clsx(styles.AuthorBadge, { [styles.nameOnly]: props.nameOnly })}>
      <div class={styles.basicInfo}>
        <Userpic
          hasLink={true}
          size={'M'}
          name={props.author.name}
          userpic={props.author.userpic}
          slug={props.author.slug}
        />
        <a href={`/author/${props.author.slug}`} class={styles.info}>
          <div class={styles.name}>
            <span>{props.author.name}</span>
          </div>
          <Show when={!props.nameOnly}>
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
          </Show>
        </a>
      </div>
      <Show when={props.author.slug !== session()?.user.slug && !props.nameOnly}>
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
                  variant={props.iconButtons ? 'secondary' : 'bordered'}
                  size="M"
                  value={subscribeValue()}
                  onClick={() => handleSubscribe(true)}
                  isSubscribeButton={true}
                  class={clsx(styles.actionButton, {
                    [styles.iconed]: props.iconButtons,
                    [stylesButton.subscribed]: subscribed()
                  })}
                />
              }
            >
              <Button
                variant={props.iconButtons ? 'secondary' : 'bordered'}
                size="M"
                value={
                  <Show
                    when={props.iconButtons}
                    fallback={
                      <>
                        <span class={styles.actionButtonLabel}>{t('Following')}</span>
                        <span class={styles.actionButtonLabelHovered}>{t('Unfollow')}</span>
                      </>
                    }
                  >
                    <Icon name="author-unsubscribe" class={stylesButton.icon} />
                  </Show>
                }
                onClick={() => handleSubscribe(false)}
                isSubscribeButton={true}
                class={clsx(styles.actionButton, {
                  [styles.iconed]: props.iconButtons,
                  [stylesButton.subscribed]: subscribed()
                })}
              />
            </Show>
          </Show>
          <Show when={props.showMessageButton}>
            <Button
              variant={props.iconButtons ? 'secondary' : 'bordered'}
              size="M"
              value={props.iconButtons ? <Icon name="inbox-white" /> : t('Message')}
              onClick={initChat}
              class={clsx(styles.actionButton, { [styles.iconed]: props.iconButtons })}
            />
          </Show>
        </div>
      </Show>
    </div>
  )
}

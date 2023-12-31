import { openPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { createMemo, createSignal, Match, Show, Switch } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { Author, FollowingEntity } from '../../../graphql/schema/core.gen'
import { router, useRouter } from '../../../stores/router'
import { follow, unfollow } from '../../../stores/zine/common'
// import { capitalize } from '../../../utils/capitalize'
import { isCyrillic } from '../../../utils/cyrillic'
import { translit } from '../../../utils/ru2en'
import { Button } from '../../_shared/Button'
import { CheckButton } from '../../_shared/CheckButton'
import { Icon } from '../../_shared/Icon'
import { Userpic } from '../Userpic'

import styles from './AuthorBadge.module.scss'
import stylesButton from '../../_shared/Button/Button.module.scss'

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
    author,
    subscriptions,
    actions: { loadSubscriptions, requireAuthentication },
  } = useSession()
  const { changeSearchParams } = useRouter()
  const { t, formatDate, lang } = useLocalize()
  const subscribed = createMemo(() =>
    subscriptions().authors.some((a: Author) => a.slug === props.author.slug),
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
      changeSearchParams({
        initChat: props.author.id.toString(),
      })
    }, 'discussions')
  }

  const name = createMemo(() => {
    if (lang() !== 'ru' && isCyrillic(props.author.name)) {
      if (props.author.name === 'Дискурс') {
        return 'Discours'
      }

      return translit(props.author.name)
    }

    return props.author.name
  })

  return (
    <div class={clsx(styles.AuthorBadge, { [styles.nameOnly]: props.nameOnly })}>
      <div class={styles.basicInfo}>
        <Userpic
          hasLink={true}
          size={'M'}
          name={name()}
          userpic={props.author.pic}
          slug={props.author.slug}
        />
        <a href={`/author/${props.author.slug}`} class={styles.info}>
          <div class={styles.name}>
            <span>{name()}</span>
          </div>
          <Show when={!props.nameOnly}>
            <Switch
              fallback={
                <div class={styles.bio}>
                  {t('Registered since {date}', {
                    date: formatDate(new Date(props.author.created_at * 1000)),
                  })}
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
      <Show when={props.author.slug !== author()?.slug && !props.nameOnly}>
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
                  value={
                    <Show
                      when={props.iconButtons}
                      fallback={
                        <Show when={isSubscribing()} fallback={t('Subscribe')}>
                          {t('subscribing...')}
                        </Show>
                      }
                    >
                      <Icon name="author-subscribe" class={stylesButton.icon} />
                    </Show>
                  }
                  onClick={() => handleSubscribe(true)}
                  isSubscribeButton={true}
                  class={clsx(styles.actionButton, {
                    [styles.iconed]: props.iconButtons,
                    [stylesButton.subscribed]: subscribed(),
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
                  [stylesButton.subscribed]: subscribed(),
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

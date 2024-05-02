import { openPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { Match, Show, Switch, createEffect, createMemo, createSignal, on } from 'solid-js'

import { useFollowing } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { useMediaQuery } from '../../../context/mediaQuery'
import { useSession } from '../../../context/session'
import { Author, FollowingEntity } from '../../../graphql/schema/core.gen'
import { router, useRouter } from '../../../stores/router'
import { translit } from '../../../utils/ru2en'
import { isCyrillic } from '../../../utils/translate'
import { BadgeSubscribeButton } from '../../_shared/BadgeSubscribeButton'
import { Button } from '../../_shared/Button'
import { CheckButton } from '../../_shared/CheckButton'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'
import { Icon } from '../../_shared/Icon'
import { Userpic } from '../Userpic'
import styles from './AuthorBadge.module.scss'

type Props = {
  author: Author
  minimizeSubscribeButton?: boolean
  showMessageButton?: boolean
  iconButtons?: boolean
  nameOnly?: boolean
  inviteView?: boolean
  onInvite?: (id: number) => void
  selected?: boolean
}
export const AuthorBadge = (props: Props) => {
  const { mediaMatches } = useMediaQuery()
  const { author, requireAuthentication } = useSession()
  const { follow, unfollow, subscriptions, subscribeInAction } = useFollowing()
  const [isMobileView, setIsMobileView] = createSignal(false)
  const [isSubscribed, setIsSubscribed] = createSignal<boolean>()

  createEffect(() => {
    if (!subscriptions || !props.author) return
    const subscribed = subscriptions.authors?.some((authorEntity) => authorEntity.id === props.author?.id)
    setIsSubscribed(subscribed)
  })

  createEffect(() => {
    setIsMobileView(!mediaMatches.sm)
  })

  const { setFollowing } = useFollowing()
  const { changeSearchParams } = useRouter()
  const { t, formatDate, lang } = useLocalize()

  const initChat = () => {
    // eslint-disable-next-line solid/reactivity
    requireAuthentication(() => {
      openPage(router, 'inbox')
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

  createEffect(
    on(
      () => props.isFollowed,
      (followed) => setIsFollowed(followed?.value),
      { defer: true },
    ),
  )

  const handleFollowClick = () => {
    requireAuthentication(() => {
      isSubscribed()
        ? unfollow(FollowingEntity.Author, props.author.slug)
        : follow(FollowingEntity.Author, props.author.slug)
    }, 'subscribe')
  }

  return (
    <div class={clsx(styles.AuthorBadge, { [styles.nameOnly]: props.nameOnly })}>
      <div class={styles.basicInfo}>
        <Userpic
          hasLink={true}
          size={isMobileView() ? 'M' : 'L'}
          name={name()}
          userpic={props.author.pic}
          slug={props.author.slug}
        />
        <ConditionalWrapper
          condition={!props.inviteView}
          wrapper={(children) => (
            <a href={`/author/${props.author.slug}`} class={styles.info}>
              {children}
            </a>
          )}
        >
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
            </Switch>
            <Show when={props.author?.stat}>
              <div class={styles.bio}>
                <Show when={props.author?.stat.shouts > 0}>
                  <div>{t('PublicationsWithCount', { count: props.author.stat?.shouts ?? 0 })}</div>
                </Show>
                <Show when={props.author?.stat.followers > 0}>
                  <div>{t('FollowersWithCount', { count: props.author.stat?.followers ?? 0 })}</div>
                </Show>
              </div>
            </Show>
          </Show>
        </ConditionalWrapper>
      </div>
      <Show when={props.author.slug !== author()?.slug && !props.nameOnly}>
        <div class={styles.actions}>
          <BadgeSubscribeButton
            action={() => handleFollowClick()}
            isSubscribed={isSubscribed()}
            actionMessageType={
              subscribeInAction()?.slug === props.author.slug ? subscribeInAction().type : undefined
            }
          />
          <Show when={props.showMessageButton}>
            <Button
              variant={props.iconButtons ? 'secondary' : 'bordered'}
              size="S"
              value={props.iconButtons ? <Icon name="inbox-white" /> : t('Message')}
              onClick={initChat}
              class={clsx(styles.actionButton, { [styles.iconed]: props.iconButtons })}
            />
          </Show>
        </div>
      </Show>
      <Show when={props.inviteView}>
        <CheckButton
          text={t('Invite')}
          checked={props.selected}
          onClick={() => props.onInvite(props.author.id)}
        />
      </Show>
    </div>
  )
}

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
import { Button } from '../../_shared/Button'
import { CheckButton } from '../../_shared/CheckButton'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'
import { Icon } from '../../_shared/Icon'
import { Userpic } from '../Userpic'

import { FollowedInfo } from '../../../pages/types'
import stylesButton from '../../_shared/Button/Button.module.scss'
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
  isFollowed?: FollowedInfo
}
export const AuthorBadge = (props: Props) => {
  const { mediaMatches } = useMediaQuery()
  const { author, requireAuthentication } = useSession()
  const [isMobileView, setIsMobileView] = createSignal(false)
  const [isFollowed, setIsFollowed] = createSignal<boolean>()

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
      () => {
        setIsFollowed(props.isFollowed?.value)
      },
    ),
  )

  const handleFollowClick = () => {
    const value = !isFollowed()
    requireAuthentication(() => {
      setIsFollowed(value)
      setFollowing(FollowingEntity.Author, props.author.slug, value)
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
          <Show
            when={!props.minimizeSubscribeButton}
            fallback={<CheckButton text={t('Follow')} checked={isFollowed()} onClick={handleFollowClick} />}
          >
            <Show
              when={isFollowed()}
              fallback={
                <Button
                  variant={props.iconButtons ? 'secondary' : 'bordered'}
                  size="S"
                  value={
                    <Show when={props.iconButtons} fallback={t('Subscribe')}>
                      <Icon name="author-subscribe" class={stylesButton.icon} />
                    </Show>
                  }
                  onClick={handleFollowClick}
                  isSubscribeButton={true}
                  class={clsx(styles.actionButton, {
                    [styles.iconed]: props.iconButtons,
                    [stylesButton.subscribed]: isFollowed(),
                  })}
                />
              }
            >
              <Button
                variant={props.iconButtons ? 'secondary' : 'bordered'}
                size="S"
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
                onClick={handleFollowClick}
                isSubscribeButton={true}
                class={clsx(styles.actionButton, {
                  [styles.iconed]: props.iconButtons,
                  [stylesButton.subscribed]: isFollowed(),
                })}
              />
            </Show>
          </Show>
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

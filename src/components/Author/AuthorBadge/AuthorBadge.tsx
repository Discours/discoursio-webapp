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
import { FollowingButton } from '../../_shared/FollowingButton'
import { Icon } from '../../_shared/Icon'
import { Userpic } from '../Userpic'
import styles from './AuthorBadge.module.scss'

type Props = {
  author: Author
  minimize?: boolean
  showMessageButton?: boolean
  iconButtons?: boolean
  nameOnly?: boolean
  inviteView?: boolean
  onInvite?: (id: number) => void
  selected?: boolean
  subscriptionsMode?: boolean
}
export const AuthorBadge = (props: Props) => {
  const { mediaMatches } = useMediaQuery()
  const { author, requireAuthentication } = useSession()
  const { follow, unfollow, follows, following } = useFollowing()
  const [isMobileView, setIsMobileView] = createSignal(false)
  const [isFollowed, setIsFollowed] = createSignal<boolean>(
    follows?.authors?.some((authorEntity) => authorEntity.id === props.author?.id),
  )
  createEffect(() => setIsMobileView(!mediaMatches.sm))
  createEffect(
    on(
      [() => follows?.authors, () => props.author, following],
      ([followingAuthors, currentAuthor, _]) => {
        setIsFollowed(followingAuthors?.some((followedAuthor) => followedAuthor.id === currentAuthor?.id))
      },
      { defer: true },
    ),
  )

  const { changeSearchParams } = useRouter()
  const { t, formatDate, lang } = useLocalize()

  const initChat = () => {
    // eslint-disable-next-line solid/reactivity
    requireAuthentication(() => {
      openPage(router, 'inbox')
      changeSearchParams({
        initChat: props.author?.id.toString(),
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

  const handleFollowClick = () => {
    requireAuthentication(async () => {
      const handle = isFollowed() ? unfollow : follow
      await handle(FollowingEntity.Author, props.author.slug)
    }, 'follow')
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
            <Show when={props.author?.stat && !props.subscriptionsMode}>
              <div class={styles.bio}>
                <Show when={props.author?.stat.shouts > 0}>
                  <div>{t('PublicationsWithCount', { count: props.author.stat?.shouts ?? 0 })}</div>
                </Show>
                <Show when={props.author?.stat.comments > 0}>
                  <div>{t('CommentsWithCount', { count: props.author.stat?.comments ?? 0 })}</div>
                </Show>
                <Show when={props.author?.stat.followers > 0}>
                  <div>{t('some followers', { count: props.author.stat?.followers ?? 0 })}</div>
                </Show>
              </div>
            </Show>
          </Show>
        </ConditionalWrapper>
      </div>
      <Show when={props.author.slug !== author()?.slug && !props.nameOnly}>
        <div class={styles.actions}>
          <FollowingButton
            action={handleFollowClick}
            isFollowed={isFollowed()}
            actionMessageType={following()?.slug === props.author.slug ? following().type : undefined}
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

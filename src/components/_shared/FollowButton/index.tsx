import { clsx } from 'clsx'
import { Show, createEffect, createMemo, createSignal, onMount } from 'solid-js'

import { useFollowing, EMPTY_SUBSCRIPTIONS } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { Author, Topic, Community, FollowingEntity } from '../../../graphql/schema/core.gen'
import { useAuthorsStore } from '../../../stores/zine/authors'
import { useTopicsStore } from '../../../stores/zine/topics'
import { Button } from '../Button'
import { CheckButton } from '../CheckButton/CheckButton'
import { Icon } from '../Icon'

import stylesAuthor from '../../Author/AuthorBadge/AuthorBadge.module.scss'
import stylesButton from '../Button/Button.module.scss'
// import stylesCheck from '../CheckButton/CheckButton.module.scss'

interface FollowButtonProps {
  slug: string
  entity: FollowingEntity.Author | FollowingEntity.Topic | FollowingEntity.Community
  iconButton?: boolean
  minimizeSubscribeButton?: boolean
}

export const FollowButton = (props: FollowButtonProps) => {
  const { t } = useLocalize()
  const {
    subscriptions,
    loading: subLoading,
    follow,
    unfollow,
    setSubscriptions,
    loadSubscriptions,
  } = useFollowing()
  const {
    author,
    actions: { requireAuthentication },
  } = useSession()
  const [isSending, setIsSending] = createSignal(false)
  const [followed, setFollowed] = createSignal()

  createEffect(() => {
    const subs = subscriptions
    if (subs && subs !== EMPTY_SUBSCRIPTIONS) {
      console.debug('subs renewed, revalidate state')
      let items = []
      if (props.entity === FollowingEntity.Author) items = subs.authors || []
      if (props.entity === FollowingEntity.Topic) items = subs.topics || []
      if (props.entity === FollowingEntity.Community) items = subs.communities || []
      setFollowed(items.some((x: Topic | Author | Community) => x?.slug === props.slug))
    }
  })

  const { authorEntities } = useAuthorsStore()
  const { topicEntities } = useTopicsStore()
  const updateSubs = (remove = false) => {
    console.debug('[FollowButton.updatedSubs] updated subscriptions postprocess')
    const updatedSubs = subscriptions
    if (props.entity === FollowingEntity.Author) {
      const a = authorEntities()[props.slug]
      if (!updatedSubs.authors) updatedSubs.authors = []
      if (remove) {
        updatedSubs.authors = updatedSubs.authors.filter((x) => x?.slug !== props.slug)
      } else if (!updatedSubs.authors.includes(a)) {
        updatedSubs.authors.push(a)
      }
    }
    if (props.entity === FollowingEntity.Topic) {
      const tpc = topicEntities()[props.slug]
      if (!updatedSubs.topics) updatedSubs.topics = []
      if (remove) {
        updatedSubs.topics = updatedSubs.topics.filter((x) => x?.slug !== props.slug)
      } else if (!updatedSubs.topics.includes(tpc)) {
        updatedSubs.topics.push(tpc)
      }
    }
    /*if(props.entity === FollowingEntity.Community) {
      const c = communityEntities()[props.slug]
      updatedSubs.communities.push(c)
    }*/
    setSubscriptions(updatedSubs)
    loadSubscriptions()
  }

  const handleFollow = async (wasnt = true) => {
    console.debug('[FollowButton.subscribe] sending server mutation')
    setIsSending(true)
    await (wasnt ? follow : unfollow)(props.entity, props.slug)
    setIsSending(false)
    setFollowed(wasnt)
    updateSubs(wasnt)
  }

  const handleClick = () => {
    console.debug('[FollowButton.handleSubscribe] handling follow click')
    setFollowed(followed())
    // eslint-disable-next-line solid/reactivity
    requireAuthentication(() => {
      if (author()) {
        handleFollow(!followed())
      }
    }, 'subscribe')
  }
  const checked = createMemo(() => {
    return author() && Boolean(followed())
  })
  return (
    <Show when={!(subLoading() && author() && subscriptions === EMPTY_SUBSCRIPTIONS)}>
      <Show
        when={!props.minimizeSubscribeButton}
        fallback={<CheckButton text={t('Follow')} checked={checked()} onClick={handleClick} />}
      >
        <Show
          when={followed()}
          fallback={
            <Button
              variant={props.iconButton ? 'secondary' : 'bordered'}
              size="S"
              value={
                <Show
                  when={props.iconButton}
                  fallback={
                    <Show when={isSending()} fallback={t('Follow')}>
                      {t('subscribing...')}
                    </Show>
                  }
                >
                  <Icon name="author-subscribe" class={stylesButton.icon} />
                </Show>
              }
              onClick={handleClick}
              isSubscribeButton={true}
              class={clsx(stylesAuthor.actionButton, {
                [stylesAuthor.iconed]: props.iconButton,
                [stylesButton.subscribed]: followed(),
              })}
            />
          }
        >
          <Button
            variant={props.iconButton ? 'secondary' : 'bordered'}
            size="S"
            value={
              <Show
                when={props.iconButton}
                fallback={
                  <>
                    <span class={stylesAuthor.actionButtonLabel}>{t('Following')}</span>
                    <span class={stylesAuthor.actionButtonLabelHovered}>{t('Unfollow')}</span>
                  </>
                }
              >
                <Icon name="author-unsubscribe" class={stylesButton.icon} />
              </Show>
            }
            onClick={handleClick}
            isSubscribeButton={true}
            class={clsx(stylesAuthor.actionButton, {
              [stylesAuthor.iconed]: props.iconButton,
              [stylesButton.subscribed]: followed(),
            })}
          />
        </Show>
      </Show>
    </Show>
  )
}

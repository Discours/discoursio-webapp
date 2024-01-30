import { clsx } from 'clsx'
import { Show, createEffect, createSignal } from 'solid-js'

import { useFollowing, EMPTY_SUBSCRIPTIONS } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { Author, Topic, Community, FollowingEntity } from '../../../graphql/schema/core.gen'
import { Button } from '../Button'
import { Icon } from '../Icon'

import stylesAuthor from '../../Author/AuthorBadge/AuthorBadge.module.scss'
import stylesButton from '../Button/Button.module.scss'
import stylesCheck from '../CheckButton/CheckButton.module.scss'
import { useAuthorsStore } from '../../../stores/zine/authors'
import { useTopicsStore } from '../../../stores/zine/topics'

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
    actions: { follow, unfollow, setSubscriptions },
  } = useFollowing()
  const {
    author,
    actions: { requireAuthentication },
  } = useSession()
  const [isSending, setIsSending] = createSignal(false)
  const [followed, setFollowed] = createSignal(false)

  createEffect(() => {
    const subs = subscriptions()
    if (subs && subs !== EMPTY_SUBSCRIPTIONS) {
      console.debug('subs renewed, revalidate state')
      let items = []
      if (props.entity === FollowingEntity.Author) items = subs.authors
      if (props.entity === FollowingEntity.Topic) items = subs.topics
      if (props.entity === FollowingEntity.Community) items = subs.communities
      setFollowed(items.some((x: Topic | Author | Community) => x?.slug === props.slug))
    }
  })

  const { authorEntities } = useAuthorsStore()
  const { topicEntities } = useTopicsStore()
  const updateSubs = () => {
    console.debug('[FollowButton.updatedSubs] updated subscriptions postprocess')
    const updatedSubs = subscriptions()
    if (props.entity === FollowingEntity.Author) {
      const a = authorEntities()[props.slug]
      if (!updatedSubs.authors.includes(a)) {
        updatedSubs.authors.push(a)
      }
    }
    if (props.entity === FollowingEntity.Topic) {
      const tpc = topicEntities()[props.slug]
      if (!updatedSubs.topics.includes(tpc)) {
        updatedSubs.topics.push(tpc)
      }
    }
    /*if(props.entity === FollowingEntity.Community) {
      const c = communityEntities()[props.slug]
      updatedSubs.communities.push(c)
    }*/
    setSubscriptions(updatedSubs)
  }

  const handleFollow = async (wasnt = true) => {
    console.debug('[FollowButton.subscribe] sending server mutation')
    setIsSending(true)
    await (wasnt ? follow : unfollow)(props.entity, props.slug)
    setIsSending(false)
    setFollowed(wasnt)
    updateSubs()
  }

  const handleClick = (ev) => {
    console.debug('[FollowButton.handleSubscribe] handling follow click')
    console.debug(ev)
    // eslint-disable-next-line solid/reactivity
    requireAuthentication(() => {
      setFollowed(followed())
      if (author()) {
        handleFollow(!followed())
      }
    }, 'subscribe')
  }
  const buttonValue = (what: FollowingEntity) => (
    <Show
      when={props.iconButton}
      fallback={
        <Show when={followed()} fallback={t('Follow')}>
          <span class={stylesButton.buttonSubscribeLabelHovered}>{t('Unfollow')}</span>
          <span class={stylesButton.buttonSubscribeLabel}>{t('Following')}</span>
        </Show>
      }
    >
      <Icon name={what === FollowingEntity.Author ? 'author-unsubscribe' : 'check-subscribed'} />
    </Show>
  )

  return props.minimizeSubscribeButton ? (
    <button type="button" class={clsx(stylesCheck.CheckButton)} onClick={handleClick}>
      <Show when={followed()} fallback={t('Follow')}>
        <span class={stylesButton.buttonSubscribeLabelHovered}>{t('Unfollow')}</span>
        <span class={stylesButton.buttonSubscribeLabel}>{t('Following')}</span>
      </Show>
    </button>
  ) : (
    <Button
      variant={props.iconButton ? 'secondary' : 'bordered'}
      size="M"
      value={props.iconButton ? t(followed() ? 'Unfollow' : 'Follow') : buttonValue(props.entity)}
      onClick={handleClick}
      isSubscribeButton={true}
      disabled={isSending()}
      class={clsx(stylesAuthor.actionButton, {
        [stylesAuthor.iconed]: props.iconButton,
        [stylesButton.subscribed]: followed(),
      })}
    />
  )
}

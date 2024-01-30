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
    actions: { follow, unfollow, setSubscriptions, loadSubscriptions },
  } = useFollowing()
  const {
    author,
    actions: { requireAuthentication },
  } = useSession()
  const [isSending, setIsSending] = createSignal(false)
  const [followed, setFollowed] = createSignal()

  createEffect(() => {
    const subs = subscriptions()
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
  const updateSubs = (unfollow = false) => {
    console.debug('[FollowButton.updatedSubs] updated subscriptions postprocess')
    const updatedSubs = subscriptions()
    if (props.entity === FollowingEntity.Author) {
      const a = authorEntities()[props.slug]
      if (!updatedSubs.authors) updatedSubs.authors = []
      if (unfollow) {
        updatedSubs.authors = updatedSubs.authors.filter((x) => x?.slug !== props.slug)
      } else if (!updatedSubs.authors.includes(a)) {
        updatedSubs.authors.push(a)
      }
    }
    if (props.entity === FollowingEntity.Topic) {
      const tpc = topicEntities()[props.slug]
      if (!updatedSubs.topics) updatedSubs.topics = []
      if (unfollow) {
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

  const handleClick = (ev) => {
    console.debug('[FollowButton.handleSubscribe] handling follow click')
    // eslint-disable-next-line solid/reactivity
    requireAuthentication(() => {
      setFollowed(followed())
      if (author()) {
        handleFollow(!followed())
      }
    }, 'subscribe')
  }
  const buttonCaptions = () => (
    <>
      <Show when={followed() === true}>
        <span class={stylesButton.buttonSubscribeLabelHovered}>{t('Unfollow')}</span>
        <span class={stylesButton.buttonSubscribeLabel}>{t('Following')}</span>
      </Show>
      <Show when={followed() === false}>{t('Follow')}</Show>
    </>
  )

  const buttonValue = (what: FollowingEntity) => (
    <Show
      when={!props.iconButton}
      fallback={<Icon name={what === FollowingEntity.Author ? 'author-unsubscribe' : 'check-subscribed'} />}
    >
      {buttonCaptions()}
    </Show>
  )

  return (
    <>
      {props.minimizeSubscribeButton ? (
        <button type="button" class={clsx(stylesCheck.CheckButton)} onClick={handleClick}>
          {buttonCaptions()}
        </button>
      ) : (
        <Button
          variant={props.iconButton ? 'secondary' : 'bordered'}
          class={clsx(stylesAuthor.actionButton, {
            [stylesAuthor.iconed]: props.iconButton,
            [stylesButton.subscribed]: followed(),
          })}
          size="M"
          value={buttonValue(props.entity)}
          onClick={handleClick}
          isSubscribeButton={true}
          disabled={isSending()}
        />
      )}
    </>
  )
}

import { clsx } from 'clsx'
import { Show, createEffect, createSignal, on } from 'solid-js'

import { useFollowing } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { Author, Topic, Community, FollowingEntity } from '../../../graphql/schema/core.gen'
import { Button } from '../Button'
import { CheckButton } from '../CheckButton'
import { Icon } from '../Icon'

import stylesAuthor from '../../Author/AuthorBadge/AuthorBadge.module.scss'
// import stylesTopic from '../../Topic/Card.module.scss'
import stylesButton from '../Button/Button.module.scss'

interface FollowButtonProps {
  slug: string
  entity: FollowingEntity.Author | FollowingEntity.Topic | FollowingEntity.Community
  topics?: Array<Topic>
  authors?: Array<Author>
  communities?: Array<Community>
  iconButton?: boolean
  minimizeSubscribeButton?: boolean
}

export const FollowButton = (props: FollowButtonProps) => {
  const { t } = useLocalize()
  const {
    subscriptions,
    actions: { follow, unfollow },
  } = useFollowing()
  const {
    actions: { requireAuthentication },
  } = useSession()
  const [isSubscribing, setIsSubscribing] = createSignal(false)
  const [subscribed, setSubscribed] = createSignal(false)

  createEffect(
    on(
      () => subscriptions(),
      (subs) => {
        let items = []
        switch (props.entity) {
          case FollowingEntity.Author: {
            items = subs.authors || []

            break
          }
          case FollowingEntity.Topic: {
            items = subs.topics || []

            break
          }
          case FollowingEntity.Community: {
            items = subs.communities || []

            break
          }
          // No default
        }
        setSubscribed(items.some((x: Topic | Author | Community) => x?.slug === props.slug))
      },
      {
        defer: true,
      },
    ),
  )

  const subscribe = async (wasnt = true) => {
    setIsSubscribing(true)
    await (wasnt ? follow : unfollow)(props.entity, props.slug)
    setSubscribed(wasnt)
    setIsSubscribing(false)
  }

  const handleSubscribe = () => {
    // eslint-disable-next-line solid/reactivity
    requireAuthentication(() => {
      subscribe(!subscribed())
    }, 'subscribe')
  }

  const subscribeValue = (what: FollowingEntity) => (
    <Show
      when={props.iconButton}
      fallback={
        <Show when={subscribed()} fallback={t('Follow')}>
          <span class={stylesButton.buttonSubscribeLabelHovered}>{t('Unfollow')}</span>
          <span class={stylesButton.buttonSubscribeLabel}>{t('Following')}</span>
        </Show>
      }
    >
      <Show when={subscribed()} fallback="+">
        <Icon name={what === FollowingEntity.Author ? 'author-unsubscribe' : 'check-subscribed'} />
      </Show>
    </Show>
  )

  return (
    <Show
      when={!props.minimizeSubscribeButton}
      fallback={<CheckButton text={t('Follow')} checked={subscribed()} onClick={handleSubscribe} />}
    >
      <Show
        when={subscribed()}
        fallback={
          <Button
            variant={props.iconButton ? 'secondary' : 'bordered'}
            size="M"
            value={subscribeValue(props.entity)}
            onClick={() => setSubscribed(false)}
            isSubscribeButton={true}
            disabled={isSubscribing()}
            class={clsx(stylesAuthor.actionButton, {
              [stylesAuthor.iconed]: props.iconButton,
              [stylesButton.subscribed]: subscribed(),
            })}
          />
        }
      >
        <Button
          variant={props.iconButton ? 'secondary' : 'bordered'}
          size="M"
          value={subscribeValue(props.entity)}
          onClick={() => setSubscribed(false)}
          isSubscribeButton={true}
          disabled={isSubscribing()}
          class={clsx(stylesAuthor.actionButton, {
            [stylesAuthor.iconed]: props.iconButton,
            [stylesButton.subscribed]: subscribed(),
          })}
        />
      </Show>
    </Show>
  )
}

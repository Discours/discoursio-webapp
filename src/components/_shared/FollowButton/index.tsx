import clsx from 'clsx'
import { Show, createEffect, createSignal, on } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { Author, Topic, Community, FollowingEntity } from '../../../graphql/schema/core.gen'
import { follow, unfollow } from '../../../stores/zine/common'
import { Button } from '../Button'
import { CheckButton } from '../CheckButton'
import { Icon } from '../Icon'

import stylesCard from '../../Topic/Card.module.scss'
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
    isSessionLoaded,
    actions: { loadSubscriptions, requireAuthentication },
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
      { defer: true },
    ),
  )

  const subscribe = async (really = true) => {
    setIsSubscribing(true)

    await (really
      ? follow({ what: props.entity, slug: props.slug })
      : unfollow({ what: props.entity, slug: props.slug }))

    setSubscribed(really)
    await loadSubscriptions()
    setIsSubscribing(false)
  }

  const handleSubscribe = () => {
    requireAuthentication(() => {
      subscribe(!subscribed())
    }, 'subscribe')
  }

  const subscribeValue = () => {
    return (
      <>
        <Show when={props.iconButton}>
          <Show when={subscribed()} fallback="+">
            <Icon name="check-subscribed" />
          </Show>
        </Show>
        <Show when={!props.iconButton}>
          <Show when={subscribed()} fallback={t('Follow')}>
            <span class={stylesButton.buttonSubscribeLabelHovered}>{t('Unfollow')}</span>
            <span class={stylesButton.buttonSubscribeLabel}>{t('Following')}</span>
          </Show>
        </Show>
      </>
    )
  }

  return (
    <Show when={isSessionLoaded()}>
      <Show
        when={!props.minimizeSubscribeButton}
        fallback={<CheckButton text={t('Follow')} checked={subscribed()} onClick={handleSubscribe} />}
      >
        <Button
          variant="bordered"
          size="M"
          value={subscribeValue()}
          onClick={handleSubscribe}
          isSubscribeButton={true}
          class={clsx(stylesCard.actionButton, {
            [stylesCard.isSubscribing]: isSubscribing(),
            [stylesButton.subscribed]: subscribed(),
          })}
          disabled={isSubscribing()}
        />
      </Show>
    </Show>
  )
}

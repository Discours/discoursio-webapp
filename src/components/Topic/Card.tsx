import { clsx } from 'clsx'
import { Show, createEffect, createMemo, createSignal, on } from 'solid-js'

import { useFollowing } from '../../context/following'
import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'
import { FollowingEntity, type Topic } from '../../graphql/schema/core.gen'
import { capitalize } from '../../utils/capitalize'
import { CardTopic } from '../Feed/CardTopic'
import { Button } from '../_shared/Button'
import { CheckButton } from '../_shared/CheckButton'
import { Icon } from '../_shared/Icon'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'

import stylesButton from '../_shared/Button/Button.module.scss'
import styles from './Card.module.scss'

interface TopicProps {
  topic: Topic
  compact?: boolean
  followed?: boolean
  shortDescription?: boolean
  subscribeButtonBottom?: boolean
  additionalClass?: string
  isTopicInRow?: boolean
  iconButton?: boolean
  showPublications?: boolean
  showDescription?: boolean
  isCardMode?: boolean
  minimize?: boolean
  isNarrow?: boolean
  withIcon?: boolean
}

export const TopicCard = (props: TopicProps) => {
  const { t, lang } = useLocalize()
  const title = createMemo(() =>
    capitalize(lang() === 'en' ? props.topic.slug.replaceAll('-', ' ') : props.topic.title || ''),
  )
  const { author, requireAuthentication } = useSession()
  const [isFollowed, setIsFollowed] = createSignal()
  const { follow, unfollow, follows, following } = useFollowing()

  createEffect(
    on(
      [() => follows, () => props.topic],
      ([flws, tpc]) => {
        if (flws && tpc) {
          const followed = flws.topics?.some((topics) => topics.id === props.topic?.id)
          setIsFollowed(followed)
        }
      },
      { defer: true },
    ),
  )

  const handleFollowClick = () => {
    requireAuthentication(() => {
      isFollowed()
        ? unfollow(FollowingEntity.Topic, props.topic.slug)
        : follow(FollowingEntity.Topic, props.topic.slug)
    }, 'follow')
  }

  const subscribeValue = () => {
    return (
      <>
        <Show when={props.iconButton}>
          <Show when={isFollowed()} fallback="+">
            <Icon name="check-followed" />
          </Show>
        </Show>
        <Show when={!props.iconButton}>
          <Show when={isFollowed()} fallback={t('Follow')}>
            <span class={stylesButton.buttonSubscribeLabelHovered}>{t('Unfollow')}</span>
            <span class={stylesButton.buttonSubscribeLabel}>{t('Following')}</span>
          </Show>
        </Show>
      </>
    )
  }

  return (
    <div class={styles.topicContainer}>
      <div
        class={styles.topic}
        classList={{
          row: !props.subscribeButtonBottom,
          [styles.topicCompact]: props.compact,
          [styles.topicInRow]: props.isTopicInRow,
        }}
      >
        <div
          classList={{
            [clsx('col-sm-18 col-md-24 col-lg-14 col-xl-15', styles.topicDetails)]: props.isNarrow,
            [clsx('col-24 col-sm-17 col-md-18', styles.topicDetails)]: props.compact,
            [clsx('col-sm-17 col-md-18', styles.topicDetails)]: !(
              props.subscribeButtonBottom ||
              props.isNarrow ||
              props.compact
            ),
          }}
        >
          <Show when={title() && !props.isCardMode}>
            <h3 class={styles.topicTitle}>
              <a href={`/topic/${props.topic.slug}`}>{title()}</a>
            </h3>
          </Show>

          <Show when={props.isCardMode}>
            <CardTopic title={props.topic.title} slug={props.topic.slug} class={styles.cardMode} />
          </Show>

          <Show when={props.topic.pic}>
            <div class={styles.topicAvatar}>
              <a href={`/topic/${props.topic.slug}`}>
                <img src={props.topic.pic} alt={title()} />
              </a>
            </div>
          </Show>

          <Show when={props.showDescription && props.topic?.body}>
            <div
              class={clsx(styles.topicDescription, 'text-truncate')}
              classList={{ [styles.topicDescriptionShort]: props.shortDescription }}
            >
              {props.topic.body}
            </div>
          </Show>
        </div>
        <div
          class={styles.controlContainer}
          classList={{
            'col-sm-6 col-md-24 col-lg-10 col-xl-9': props.isNarrow,
            'col-24 col-sm-7 col-md-6': props.compact,
            'col-sm-7 col-md-6': !(props.subscribeButtonBottom || props.isNarrow || props.compact),
          }}
        >
          <ShowOnlyOnClient>
            <Show when={author()}>
              <Show
                when={!props.minimize}
                fallback={
                  <CheckButton
                    text={t('Follow')}
                    checked={Boolean(isFollowed())}
                    onClick={handleFollowClick}
                  />
                }
              >
                <Button
                  variant="bordered"
                  size="M"
                  value={subscribeValue()}
                  onClick={handleFollowClick}
                  isSubscribeButton={true}
                  class={clsx(styles.actionButton, {
                    [styles.isFollowing]:
                      following()?.slug === props.topic.slug ? following().type : undefined,
                    [stylesButton.followed]: isFollowed(),
                  })}
                />
              </Show>
            </Show>
          </ShowOnlyOnClient>
        </div>
      </div>
    </div>
  )
}

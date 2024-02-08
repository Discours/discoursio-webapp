import { clsx } from 'clsx'
import { Show, createMemo, createSignal } from 'solid-js'

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
  subscribed?: boolean
  shortDescription?: boolean
  subscribeButtonBottom?: boolean
  additionalClass?: string
  isTopicInRow?: boolean
  iconButton?: boolean
  showPublications?: boolean
  showDescription?: boolean
  isCardMode?: boolean
  minimizeSubscribeButton?: boolean
  isNarrow?: boolean
  withIcon?: boolean
}

export const TopicCard = (props: TopicProps) => {
  const { t, lang } = useLocalize()
  const title = createMemo(() =>
    capitalize(lang() === 'en' ? props.topic.slug.replaceAll('-', ' ') : props.topic.title || '')
  )
  const { author, requireAuthentication } = useSession()
  const { setFollowing, loading: subLoading } = useFollowing()
  const [followed, setFollowed] = createSignal()

  const handleFollowClick = () => {
    const value = !followed()
    requireAuthentication(() => {
      setFollowed(value)
      setFollowing(FollowingEntity.Topic, props.topic.slug, value)
    }, 'subscribe')
  }

  const subscribeValue = () => {
    return (
      <>
        <Show when={props.iconButton}>
          <Show when={followed()} fallback="+">
            <Icon name="check-subscribed" />
          </Show>
        </Show>
        <Show when={!props.iconButton}>
          <Show when={followed()} fallback={t('Follow')}>
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
          [styles.topicInRow]: props.isTopicInRow
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
            )
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
            'col-sm-7 col-md-6': !(props.subscribeButtonBottom || props.isNarrow || props.compact)
          }}
        >
          <ShowOnlyOnClient>
            <Show when={author()}>
              <Show
                when={!props.minimizeSubscribeButton}
                fallback={
                  <CheckButton
                    text={t('Follow')}
                    checked={Boolean(followed())}
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
                    [styles.isSubscribing]: subLoading(),
                    [stylesButton.subscribed]: followed()
                  })}
                  // disabled={subLoading()}
                />
              </Show>
            </Show>
          </ShowOnlyOnClient>
        </div>
      </div>
    </div>
  )
}

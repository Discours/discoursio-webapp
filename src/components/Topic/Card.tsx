import { capitalize, plural } from '../../utils'
import { Show } from 'solid-js/web'
import style from './Card.module.scss'
import { createMemo } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { FollowingEntity } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { locale } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { follow, unfollow } from '../../stores/zine/common'

interface TopicProps {
  topic: Topic
  compact?: boolean
  subscribed?: boolean
  shortDescription?: boolean
  subscribeButtonBottom?: boolean
  additionalClass?: string
  isTopicInRow?: boolean
  iconButton?: boolean
}

export const TopicCard = (props: TopicProps) => {
  const { session } = useAuthStore()

  const subscribed = createMemo(() => {
    if (!session()?.user?.slug || !session()?.news?.topics) {
      return false
    }

    return session()?.news.topics.includes(props.topic.slug)
  })

  // FIXME use store actions
  const subscribe = async (really = true) => {
    if (really) {
      follow({ what: FollowingEntity.Topic, slug: props.topic.slug })
    } else {
      unfollow({ what: FollowingEntity.Topic, slug: props.topic.slug })
    }
  }
  return (
    <div
      class={style.topic}
      classList={{
        row: !props.compact && !props.subscribeButtonBottom,
        [style.topicInRow]: props.isTopicInRow
      }}
    >
      <div classList={{ 'col-md-7': !props.compact && !props.subscribeButtonBottom }}>
        <Show when={props.topic.title}>
          <div class={style.topicTitle}>
            <a href={`/topic/${props.topic.slug}`}>{capitalize(props.topic.title || '')}</a>
          </div>
        </Show>
        <Show when={props.topic.pic}>
          <div class={style.topicAvatar}>
            <a href={props.topic.slug}>
              <img src={props.topic.pic} alt={props.topic.title} />
            </a>
          </div>
        </Show>

        <Show when={!props.compact && props.topic?.body}>
          <div
            class={style.topicDescription}
            classList={{ 'topic-description--short': props.shortDescription }}
          >
            {props.topic.body}
          </div>
        </Show>

        <Show when={props.topic?.stat}>
          <div class={style.topicDetails}>
            <Show when={!props.compact}>
              <span class={style.topicDetailsTtem} classList={{ compact: props.compact }}>
                {props.topic.stat?.shouts +
                  ' ' +
                  t('post') +
                  plural(
                    props.topic.stat?.shouts || 0,
                    locale() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's']
                  )}
              </span>
              <span class={style.topicDetailsTtem} classList={{ compact: props.compact }}>
                {props.topic.stat?.authors +
                  ' ' +
                  t('author') +
                  plural(
                    props.topic.stat?.authors || 0,
                    locale() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's']
                  )}
              </span>
              <span class={style.topicDetailsItem} classList={{ compact: props.compact }}>
                {props.topic.stat?.followers +
                  ' ' +
                  t('follower') +
                  plural(
                    props.topic.stat?.followers || 0,
                    locale() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's']
                  )}
              </span>
              {/*FIXME*/}
              {/*<Show when={false && !props.subscribeButtonBottom}>*/}
              {/*  <span class='topic-details__item'>*/}
              {/*    {topic().stat?.viewed +*/}
              {/*      ' ' +*/}
              {/*      t('view') +*/}
              {/*      plural(*/}
              {/*        topic().stat?.viewed || 0,*/}
              {/*        locale() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's']*/}
              {/*      )}*/}
              {/*  </span>*/}
              {/*</Show>*/}
            </Show>

            {/*
              <span class='topic-details__item'>
                {subscribers().toString() + ' ' + t('follower') + plural(
                  subscribers(),
                  locale() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's']
                )}
              </span>
*/}
          </div>
        </Show>
      </div>
      <div classList={{ 'col-md-3': !props.compact && !props.subscribeButtonBottom }}>
        <Show
          when={subscribed()}
          fallback={
            <button onClick={() => subscribe(true)} class="button--light">
              <Show when={props.iconButton}>{/*<Icon name={}/>*/}</Show>

              <Show when={!props.iconButton}>+&nbsp;{t('Follow')}</Show>
            </button>
          }
        >
          <button onClick={() => subscribe(false)} class="button--light">
            <Show when={props.iconButton}>{/*<Icon name={}/>*/}</Show>

            <Show when={!props.iconButton}>-&nbsp;{t('Unfollow')}</Show>
          </button>
        </Show>
      </div>
    </div>
  )
}

import { capitalize, plural } from '../../utils'
import { Show } from 'solid-js/web'
import './Card.scss'
import { createMemo } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { FollowingEntity } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { locale as locstore } from '../../stores/ui'
import { useStore } from '@nanostores/solid'
import { session } from '../../stores/auth'
import { follow, unfollow } from '../../stores/zine/common'

interface TopicProps {
  topic: Topic
  compact?: boolean
  subscribed?: boolean
  shortDescription?: boolean
  subscribeButtonBottom?: boolean
}

export const TopicCard = (props: TopicProps) => {
  const locale = useStore(locstore)
  const auth = useStore(session)

  const topic = createMemo(() => props.topic)

  const subscribed = createMemo(() => {
    return Boolean(auth()?.user?.slug) && topic().slug ? topic().slug in auth().info.topics : false
  })

  // FIXME use store actions
  const subscribe = async (really = true) => {
    if (really) {
      follow({ what: FollowingEntity.Topic, slug: topic().slug })
    } else {
      unfollow({ what: FollowingEntity.Topic, slug: topic().slug })
    }
  }
  return (
    <div class="topic" classList={{ row: !props.compact && !props.subscribeButtonBottom }}>
      <div classList={{ 'col-md-7': !props.compact && !props.subscribeButtonBottom }}>
        <Show when={topic().title}>
          <div class="topic-title">
            <a href={`/topic/${topic().slug}`}>{capitalize(topic().title || '')}</a>
          </div>
        </Show>
        <Show when={topic().pic}>
          <div class="topic__avatar">
            <a href={topic().slug}>
              <img src={topic().pic} alt={topic().title} />
            </a>
          </div>
        </Show>

        <Show when={!props.compact && topic()?.body}>
          <div class="topic-description" classList={{ 'topic-description--short': props.shortDescription }}>
            {topic().body}
          </div>
        </Show>

        <Show when={topic()?.stat}>
          <div class="topic-details">
            <Show when={!props.compact}>
              <span class="topic-details__item" classList={{ compact: props.compact }}>
                {topic().stat?.shouts +
                  ' ' +
                  t('post') +
                  plural(topic().stat?.shouts || 0, locale() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's'])}
              </span>
              <span class="topic-details__item" classList={{ compact: props.compact }}>
                {topic().stat?.authors +
                  ' ' +
                  t('author') +
                  plural(topic().stat?.authors || 0, locale() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's'])}
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
              +&nbsp;{t('Follow')}
            </button>
          }
        >
          <button onClick={() => subscribe(false)} class="button--light">
            -&nbsp;{t('Unfollow')}
          </button>
        </Show>
      </div>
    </div>
  )
}

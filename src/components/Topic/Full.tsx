import { createMemo } from 'solid-js'
import { Show } from 'solid-js/web'
import type { Topic } from '../../graphql/types.gen'
import { FollowingEntity } from '../../graphql/types.gen'
import './Full.scss'
import { session } from '../../stores/auth'
import { useStore } from '@nanostores/solid'
import { follow, unfollow } from '../../stores/zine/common'
import { t } from '../../utils/intl'

type Props = {
  topic: Topic
}

export const FullTopic = (props: Props) => {
  const auth = useStore(session)
  const subscribed = createMemo(() => auth()?.info?.topics?.includes(props.topic?.slug))
  return (
    <div class="topic-full container">
      <div class="row">
        <Show when={!!props.topic?.slug}>
          <div class="topic__header col-md-8 offset-md-2">
            <h1>#{props.topic.title}</h1>
            <p>{props.topic.body}</p>
            <div class="topic__actions">
              <Show when={!subscribed()}>
                <button
                  onClick={() => follow({ what: FollowingEntity.Topic, slug: props.topic.slug })}
                  class="button"
                >
                  {t('Follow the topic')}
                </button>
              </Show>
              <Show when={subscribed()}>
                <button
                  onClick={() => unfollow({ what: FollowingEntity.Topic, slug: props.topic.slug })}
                  class="button"
                >
                  {t('Unfollow the topic')}
                </button>
              </Show>
              <a href={`/create/${props.topic.slug}`}>{t('Write about the topic')}</a>
            </div>
            <Show when={props.topic.pic}>
              <img src={props.topic.pic} alt={props.topic.title} />
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

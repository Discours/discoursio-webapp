import { For, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import { Icon } from '../_shared/Icon'
import './Topics.scss'

import { useLocalize } from '../../context/localize'

export const NavTopics = (props: { topics: Topic[] }) => {
  const { t, lang } = useLocalize()
  const tag = (topic: Topic) =>
    /[ЁА-яё]/.test(topic.title || '') && lang() !== 'ru' ? topic.slug : topic.title
  // TODO: something about subtopics
  return (
    <nav class="subnavigation wide-container text-2xl">
      <ul class="topics">
        <Show when={props.topics.length > 0}>
          <For each={props.topics}>
            {(topic) => (
              <li class="item">
                <a href={`/topic/${topic.slug}`}>
                  <span>#{tag(topic)}</span>
                </a>
              </li>
            )}
          </For>
          <li class="item right">
            <a href={`/topics`}>
              <span>
                <Icon name="arrow-right-black" style={{ height: '12px', display: 'inline-block' }} />
                <small style={{ margin: '4px' }}>{t('All topics')} </small>
              </span>
            </a>
          </li>
        </Show>
      </ul>
    </nav>
  )
}

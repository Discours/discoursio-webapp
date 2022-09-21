import { For, Show } from 'solid-js'
import type { Topic } from '../../graphql/types.gen'
import Icon from './Icon'
import './Topics.scss'
import { t } from '../../utils/intl'
import { locale as langstore } from '../../stores/ui'
import { useStore } from '@nanostores/solid'

export default (props: { topics: Topic[] }) => {
  const locale = useStore(langstore)

  const tag = (t: Topic) => (/[ЁА-яё]/.test(t.title || '') && locale() !== 'ru' ? t.slug : t.title)

  // TODO: something about subtopics
  return (
    <nav class="subnavigation wide-container text-2xl">
      <ul class="topics">
        <Show when={props.topics.length > 0}>
          <For each={props.topics}>
            {(t: Topic) => (
              <li class="item">
                <a href={`/topic/${t.slug}`}>
                  <span>#{tag(t)}</span>
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

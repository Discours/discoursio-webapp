import { clsx } from 'clsx'
import { For, Show, createSignal } from 'solid-js'
import { useLocalize } from '~/context/localize'
import type { Topic } from '~/graphql/schema/core.gen'
import styles from './TopicSelect.module.scss'

type TopicSelectProps = {
  topics: Topic[]
  selectedTopics: Topic[]
  onChange: (selectedTopics: Topic[]) => void
  mainTopic?: Topic
  onMainTopicChange: (mainTopic: Topic) => void
}

export const TopicSelect = (props: TopicSelectProps) => {
  const { t } = useLocalize()
  const [isOpen, setIsOpen] = createSignal(false)
  const [searchTerm, setSearchTerm] = createSignal('')

  const handleChange = (topic: Topic) => {
    const isSelected = props.selectedTopics.some((selectedTopic) => selectedTopic.slug === topic.slug)
    let newSelectedTopics: Topic[]

    if (isSelected) {
      newSelectedTopics = props.selectedTopics.filter((selectedTopic) => selectedTopic.slug !== topic.slug)
    } else {
      newSelectedTopics = [...props.selectedTopics, topic]
    }

    props.onChange(newSelectedTopics)
  }

  const handleMainTopicChange = (topic: Topic) => {
    props.onMainTopicChange(topic)
    setIsOpen(false)
  }

  const handleSearch = (event: InputEvent) => {
    setSearchTerm((event.currentTarget as HTMLInputElement).value)
  }

  const filteredTopics = () => {
    return props.topics.filter((topic: Topic) =>
      topic?.title?.toLowerCase().includes(searchTerm().toLowerCase())
    )
  }

  return (
    <div class="TopicSelect">
      <div class={styles.selectedTopics}>
        <For each={props.selectedTopics}>
          {(topic) => (
            <div
              class={clsx(styles.selectedTopic, {
                [styles.mainTopic]: props.mainTopic?.slug === topic.slug
              })}
              onClick={() => handleMainTopicChange(topic)}
            >
              {topic.title}
            </div>
          )}
        </For>
      </div>
      <div class={styles.selectWrapper} onClick={() => setIsOpen(true)}>
        <input
          type="text"
          placeholder={t('Topics')}
          class={styles.searchInput}
          value={searchTerm()}
          onInput={handleSearch}
        />
        <Show when={isOpen()}>
          <div class={styles.options}>
            <For each={filteredTopics()}>
              {(topic) => (
                <div
                  class={clsx(styles.option, {
                    [styles.disabled]: props.selectedTopics.some(
                      (selectedTopic) => selectedTopic.slug === topic.slug
                    )
                  })}
                  onClick={() => handleChange(topic)}
                >
                  {topic.title}
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}

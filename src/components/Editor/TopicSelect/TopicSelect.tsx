import type { Topic } from '../../../graphql/types.gen'
import { createOptions, Select } from '@thisbeyond/solid-select'
import { useLocalize } from '../../../context/localize'
import '@thisbeyond/solid-select/style.css'
import './TopicSelect.scss'
import styles from './TopicSelect.module.scss'
import { clsx } from 'clsx'
import { createSignal } from 'solid-js'
import { slugify } from '../../../utils/slugify'
import { clone } from '../../../utils/clone'

type TopicSelectProps = {
  topics: Topic[]
  selectedTopics: Topic[]
  onChange: (selectedTopics: Topic[]) => void
  mainTopic?: Topic
  onMainTopicChange: (mainTopic: Topic) => void
}

export const TopicSelect = (props: TopicSelectProps) => {
  const { t } = useLocalize()

  const [isDisabled, setIsDisabled] = createSignal(false)

  const createValue = (title): Topic => {
    const minId = Math.min(...props.selectedTopics.map((topic) => topic.id))
    const id = minId < 0 ? minId - 1 : -2
    return { id, title, slug: slugify(title) }
  }

  const selectProps = createOptions(props.topics, {
    key: 'title',
    disable: (topic) => {
      return props.selectedTopics.some((selectedTopic) => selectedTopic.slug === topic.slug)
    },
    createable: createValue
  })

  const handleChange = (selectedTopics: Topic[]) => {
    props.onChange(selectedTopics)
  }

  const handleSelectedItemClick = (topic: Topic) => {
    setIsDisabled(true)
    props.onMainTopicChange(topic)
    setIsDisabled(false)
  }

  const format = (item, type) => {
    if (type === 'option') {
      return item.label
    }

    const isMainTopic = item.id === props.mainTopic.id

    return (
      <div
        class={clsx(styles.selectedItem, {
          [styles.mainTopic]: isMainTopic
        })}
        onClick={() => handleSelectedItemClick(item)}
      >
        {item.title}
      </div>
    )
  }

  const initialValue = clone(props.selectedTopics)

  return (
    <Select
      multiple={true}
      disabled={isDisabled()}
      initialValue={initialValue}
      {...selectProps}
      format={format}
      placeholder={t('Topics')}
      class="TopicSelect"
      onChange={handleChange}
    />
  )
}

import type { Topic } from '../../../graphql/types.gen'
import { createOptions, Select } from '@thisbeyond/solid-select'
import { useLocalize } from '../../../context/localize'
import '@thisbeyond/solid-select/style.css'
import './TopicSelect.scss'

type TopicSelectProps = {
  topics: Topic[]
  selectedTopics: Topic[]
  onChange: (selectedTopics: Topic[]) => void
}

export const TopicSelect = (props: TopicSelectProps) => {
  const { t } = useLocalize()

  const selectProps = createOptions(props.topics, {
    key: 'title',
    disable: (topic) => {
      console.log({ selectedTopics: clone(props.selectedTopics) })
      return props.selectedTopics.includes(topic)
    }
  })

  const handleChange = (selectedTopics: Topic[]) => {
    props.onChange(selectedTopics)
  }

  return (
    <Select
      multiple={true}
      {...selectProps}
      placeholder={t('Topics')}
      class="TopicSelect"
      onChange={handleChange}
    />
  )
}

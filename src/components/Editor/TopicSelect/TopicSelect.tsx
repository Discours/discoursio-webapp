import type { Topic } from '../../../graphql/types.gen'
import { createOptions, Select } from '@thisbeyond/solid-select'
import { useLocalize } from '../../../context/localize'
import '@thisbeyond/solid-select/style.css'

type TopicSelectProps = {
  topics: Topic[]
  onChange: (selectedTopics: Topic[]) => void
}

export const TopicSelect = (props: TopicSelectProps) => {
  const { t } = useLocalize()

  const selectProps = createOptions(props.topics, { key: 'title' })

  const handleChange = (selectedTopics: Topic[]) => {
    props.onChange(selectedTopics)
  }

  return <Select multiple={true} {...selectProps} placeholder={t('Topics')} onChange={handleChange} />
}

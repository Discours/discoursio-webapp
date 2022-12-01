import styles from './SearchField.module.scss'
import { Icon } from './Icon'
import { t } from '../../utils/intl'

type SearchFieldProps = {
  onChange: (value: string) => void
}

export const SearchField = (props: SearchFieldProps) => {
  const handleInputChange = (event) => props.onChange(event.target.value.trim())

  return (
    <div class={styles.searchField}>
      <label for="search-field">
        <Icon name="search" class={styles.icon} />
      </label>
      <input id="search-field" type="text" onInput={handleInputChange} placeholder={t('Search')} />
    </div>
  )
}

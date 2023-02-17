import styles from './SearchField.module.scss'
import { Icon } from './Icon'

import { clsx } from 'clsx'
import { useLocalize } from '../../context/localize'

type SearchFieldProps = {
  onChange: (value: string) => void
  class?: string
}

export const SearchField = (props: SearchFieldProps) => {
  const handleInputChange = (event) => props.onChange(event.target.value.trim())
  const { t } = useLocalize()
  return (
    <div class={clsx(styles.searchField, props.class)}>
      <label for="search-field">
        <Icon name="search" class={styles.icon} />
      </label>
      <input
        id="search-field"
        type="text"
        class="search-input"
        onInput={handleInputChange}
        placeholder={t('Search')}
      />
      <label for="search-field">Поиск</label>
    </div>
  )
}

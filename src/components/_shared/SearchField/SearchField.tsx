import { clsx } from 'clsx'

import { useLocalize } from '../../../context/localize'
import { Icon } from '../Icon'

import styles from './SearchField.module.scss'

type Props = {
  onChange: (value: string) => void
  class?: string
  variant?: 'bordered'
}

export const SearchField = (props: Props) => {
  const handleInputChange = (event) => props.onChange(event.target.value.trim())
  const { t } = useLocalize()
  return (
    <div class={clsx(styles.searchField, props.class, { [styles.bordered]: props.variant === 'bordered' })}>
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
      <label for="search-field">{t('Search')}</label>
    </div>
  )
}

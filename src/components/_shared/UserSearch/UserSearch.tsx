import { clsx } from 'clsx'
import { createSignal, For, onMount, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { Author } from '../../../graphql/types.gen'
import { apiClient } from '../../../utils/apiClient'
import { AuthorBadge } from '../../Author/AuthorBadge'
import { Button } from '../Button'
import { DropdownSelect } from '../DropdownSelect'
import { Loading } from '../Loading'

import styles from './UserSearch.module.scss'

type Props = {
  class?: string
  placeholder: string
  onChange: (value: string) => void
}

export const UserSearch = (props: Props) => {
  const { t } = useLocalize()
  const roles = [
    {
      title: t('Redactor'),
      description: t('Can write and edit text directly, and accept or reject suggestions from others'),
    },
    {
      title: t('Co-author'),
      description: t('Can make any changes, accept or reject suggestions, and share access with others'),
    },
    {
      title: t('Commentator'),
      description: t('Can offer edits and comments, but cannot edit the post or share access with others'),
    },
  ]
  const handleInputChange = (value: string) => {
    props.onChange(value)
  }

  return (
    <div class={clsx(styles.UserSearch, props.class)}>
      <div class={styles.searchHeader}>
        <div class={styles.field}>
          <input
            class={styles.input}
            type="text"
            placeholder={props.placeholder ?? t('Search')}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <DropdownSelect selectItems={roles} />
        </div>

        <Button variant={'bordered'} size={'M'} value={t('Add')} />
      </div>

      <div class={styles.teaser}>
        <h3>{t('Coming soon')}</h3>
        <p>
          {t(
            'We are working on collaborative editing of articles and in the near future you will have an amazing opportunity - to create together with your colleagues',
          )}
        </p>
      </div>
    </div>
  )
}

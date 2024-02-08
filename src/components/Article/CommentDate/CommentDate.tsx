import type { Reaction } from '../../../graphql/schema/core.gen'

import { clsx } from 'clsx'
import { Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { Icon } from '../../_shared/Icon'

import styles from './CommentDate.module.scss'

type Props = {
  comment: Reaction
  isShort?: boolean
  isLastInRow?: boolean
  showOnHover?: boolean
}

export const CommentDate = (props: Props) => {
  const { t, formatDate } = useLocalize()

  const formattedDate = (date: number) => {
    const formatDateOptions: Intl.DateTimeFormatOptions = props.isShort
      ? { month: 'long', day: 'numeric', year: 'numeric' }
      : { hour: 'numeric', minute: 'numeric' }

    return formatDate(new Date(date), formatDateOptions)
  }

  return (
    <div
      class={clsx(styles.commentDates, {
        [styles.commentDatesLastInRow]: props.isLastInRow,
        [styles.showOnHover]: props.showOnHover
      })}
    >
      <time class={styles.date}>{formattedDate(props.comment.created_at * 1000)}</time>
      <Show when={props.comment.updated_at}>
        <time class={styles.date}>
          <Icon name="edit" class={styles.icon} />
          <span class={styles.text}>
            {t('Edited')} {formattedDate(props.comment.updated_at * 1000)}
          </span>
        </time>
      </Show>
    </div>
  )
}

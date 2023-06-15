import styles from './CommentDate.module.scss'
import { Icon } from '../_shared/Icon'
import { Show, createMemo } from 'solid-js'
import type { Reaction } from '../../graphql/types.gen'
import { formatDate } from '../../utils'
import { useLocalize } from '../../context/localize'
import { clsx } from 'clsx'

type Props = {
  comment: Reaction
  isShort?: boolean
  isLastInRow?: boolean
}

export const CommentDate = (props: Props) => {
  const { t } = useLocalize()

  const formattedDate = (date) =>
    props.isShort
      ? formatDate(new Date(date), { month: 'long', day: 'numeric', year: 'numeric' })
      : createMemo(() => formatDate(new Date(date), { hour: 'numeric', minute: 'numeric' }))()

  return (
    <div class={clsx(styles.commentDates, { [styles.commentDatesLastInRow]: props.isLastInRow })}>
      <time class={styles.date}>{formattedDate(props.comment.createdAt)}</time>
      <Show when={props.comment.updatedAt}>
        <time class={styles.date}>
          <Icon name="edit" class={styles.icon} />
          {t('Edited')} {formattedDate(props.comment.updatedAt)}
        </time>
      </Show>
    </div>
  )
}

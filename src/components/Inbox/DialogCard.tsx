import styles from './DialogCard.module.scss'
import DialogAvatar from './DialogAvatar'
import type { ChatMember } from '../../graphql/types.gen'
import GroupDialogAvatar from './GroupDialogAvatar'

type DialogProps = {
  online?: boolean
  message?: string
  counter?: number
  title?: string
  ownSlug: string
  members: ChatMember[]
  onClick: () => void
}

const DialogCard = (props: DialogProps) => {
  if (!props.members) return
  const companions = props.members.filter((member) => member.slug !== props.ownSlug)
  return (
    <div class={styles.DialogCard} onClick={props.onClick}>
      <div class={styles.avatar}>
        {companions.length > 2 ? (
          <GroupDialogAvatar users={companions} />
        ) : (
          <DialogAvatar name={props.members[0].name} url={props.members[0].userpic} />
        )}
      </div>
      <div class={styles.row}>
        {companions.length > 1 ? (
          <div class={styles.name}>{props.title}</div>
        ) : (
          <div class={styles.name}>{companions[0].name}</div>
        )}
        <div class={styles.message}>
          Указать предпочтительные языки для результатов поиска можно в разделе
        </div>
      </div>
      <div class={styles.activity}>
        <div class={styles.time}>22:22</div>
        <div class={styles.counter}>
          <span>12</span>
        </div>
      </div>
    </div>
  )
}

export default DialogCard

import styles from './DialogCard.module.scss'
import DialogAvatar from './DialogAvatar'
import type { ChatMember } from '../../graphql/types.gen'
import GroupDialogAvatar from './GroupDialogAvatar'
import { Show } from 'solid-js'

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
  const companions = props.members && props.members.filter((member) => member.slug !== props.ownSlug)
  return (
    <Show when={props.members}>
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
    </Show>
  )
}

export default DialogCard

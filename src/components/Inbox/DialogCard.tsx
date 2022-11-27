import styles from './DialogCard.module.scss'
import DialogAvatar from './DialogAvatar'
import type { Author, ChatMember, User } from '../../graphql/types.gen'
import { t } from '../../utils/intl'

type DialogProps = {
  online?: boolean
  message?: string
  counter?: number
  members: ChatMember[]
  ownSlug: User['slug']
}

const DialogCard = (props: DialogProps) => {
  const participants = props.members.filter((m) => m.slug !== props.ownSlug)
  console.log('!!! participants:', participants)
  return (
    //DialogCardView - подумать
    <div class={styles.DialogCard}>
      <div class={styles.avatar}>
        <DialogAvatar name={participants[0].name} online={props.online} />
      </div>
      <div class={styles.row}>
        <div class={styles.name}>{participants[0].name}</div>
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

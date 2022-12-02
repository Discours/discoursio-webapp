import styles from './DialogCard.module.scss'
import DialogAvatar from './DialogAvatar'
import type { Author, ChatMember, User } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { Show } from 'solid-js'
import { useSession } from '../../context/session'

type DialogProps = {
  online?: boolean
  message?: string
  counter?: number
  members: ChatMember[]
}

const DialogCard = (props: DialogProps) => {
  const { session } = useSession()
  const participants = props.members?.filter((m) => m?.id !== session().user.id) || []
  console.log('!!! participants:', participants)
  return (
    //DialogCardView - подумать
    <Show when={participants?.length > 0}>
      <div class={styles.DialogCard}>
        <div class={styles.avatar}>
          <DialogAvatar name={participants[0].name} online={props.online} />
        </div>
        <div class={styles.row}>
          <div class={styles.name}>{participants[0].name}</div>
          <div class={styles.message}>{t('You can announce your languages in profile')}</div>
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

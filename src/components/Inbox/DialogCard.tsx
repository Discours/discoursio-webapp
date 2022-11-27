import styles from './DialogCard.module.scss'
import DialogAvatar from './DialogAvatar'
import type { Author, Chat, User } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { t } from '../../utils/intl'
import { useInbox } from '../../context/inbox'

type DialogProps = {
  online?: boolean
  message?: string
  counter?: number
  users: unknown[]
  ownSlug: string
}

const DialogCard = (props: DialogProps) => {
  const companions = props.users.filter((user) => user !== props.ownSlug)
  console.log('!!! companions:', companions)
  return (
    <div class={styles.DialogCard}>
      <div class={styles.avatar}>{/*<DialogAvatar name={participants[0]} online={props.online} />*/}</div>
      <div class={styles.row}>
        {/*{companions.length > 1 && (*/}
        {/*  <div class={styles.name}>*/}
        {/*    */}
        {/*  </div>*/}
        {/*)}*/}
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

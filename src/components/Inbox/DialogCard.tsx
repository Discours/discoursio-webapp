import './DialogCard.module.scss'
import styles from './DialogCard.module.scss'
import DialogAvatar from './DialogAvatar'
import type { Author } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'

type Props = {
  online?: boolean
  message?: string
  counter?: number
  ownerSlug: Author['slug']
} & Author

const DialogCard = (props: Props) => {
  const handleOpenChat = async () => {
    try {
      const initChat = await apiClient.createChat({
        title: 'test chat',
        members: [props.slug, props.ownerSlug]
      })
      console.log('!!! test:', initChat.data)
    } catch (error) {
      console.log('!!! errr:', error)
    }
  }

  return (
    <div class={styles.DialogCard} onClick={handleOpenChat}>
      <div class={styles.avatar}>
        <DialogAvatar name={props.name} url={props.userpic} online={props.online} />
      </div>
      <div class={styles.row}>
        <div class={styles.name}>{props.name}</div>
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

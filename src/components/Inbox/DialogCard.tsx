import './DialogCard.module.scss'
import styles from './DialogCard.module.scss'
import DialogAvatar from './DialogAvatar'
import type { Author } from '../../graphql/types.gen'
import { useAuthStore } from '../../stores/auth'
import { createEffect, createSignal } from 'solid-js'
import { apiClient } from '../../utils/apiClient'

const { session } = useAuthStore()

type Props = {
  online?: boolean
  message?: string
  counter?: number
} & Author

const createChat = async ({ title, members }: { title?: string; members?: string[] }): Promise<void> => {
  await apiClient.createChat({ title, members })
}

const DialogCard = (props: Props) => {
  const [currentUser, setCurrentUser] = createSignal(undefined)
  createEffect(() => {
    setCurrentUser(session()?.user?.slug)
  })

  const handleOpenChat = async () => {
    try {
      const test = await apiClient.createChat({
        title: 'test chat',
        members: [props.slug, currentUser()]
      })
      console.log('!!! test:', test)
    } catch (err) {
      console.log('!!! errr:', err)
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

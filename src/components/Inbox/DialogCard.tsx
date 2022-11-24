import styles from './DialogCard.module.scss'
import DialogAvatar from './DialogAvatar'
import type { Author, AuthResult } from '../../graphql/types.gen'
import { useSession } from '../../context/session'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { apiClient } from '../../utils/apiClient'

type DialogProps = {
  online?: boolean
  message?: string
  counter?: number
  author?: Author
  ownSlug: Author['slug']
}

const DialogCard = (props: DialogProps) => {
  const handleOpenChat = async () => {
    try {
      const initChat = await apiClient.createChat({
        title: 'test chat',
        members: [props.author.slug, props.ownSlug]
      })
      console.debug('[initChat]', initChat.data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div class={styles.DialogCard} onClick={handleOpenChat}>
      <div class={styles.avatar}>
        <DialogAvatar name={props.author.name} url={props.author.userpic} online={props.online} />
      </div>
      <div class={styles.row}>
        <div class={styles.name}>{props.author.name}</div>
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

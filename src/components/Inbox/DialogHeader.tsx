import type { Chat } from '../../graphql/types.gen'
import styles from './DialogHeader.module.scss'
import DialogCard from './DialogCard'

type DialogHeader = {
  chat: Chat
  currentSlug: string
}

const DialogHeader = (props: DialogHeader) => {
  return (
    <header class={styles.DialogHeader}>
      <DialogCard
        isChatHeader={true}
        title={props.chat.title}
        members={props.chat.members}
        ownSlug={props.currentSlug}
      />
    </header>
  )
}

export default DialogHeader

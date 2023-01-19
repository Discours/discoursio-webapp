import type { Chat } from '../../graphql/types.gen'
import styles from './DialogHeader.module.scss'
import DialogCard from './DialogCard'

type DialogHeader = {
  chat: Chat
  ownId: number
}
const DialogHeader = (props: DialogHeader) => {
  return (
    <header class={styles.DialogHeader}>
      <DialogCard
        isChatHeader={true}
        title={props.chat.title || props.chat.members[0].name}
        members={props.chat.members}
        ownId={props.ownId}
      />
    </header>
  )
}

export default DialogHeader

import type { Chat } from '../../graphql/types.gen'

import DialogCard from './DialogCard'

import styles from './DialogHeader.module.scss'

type DialogHeader = {
  chat: Chat
  ownId: number
}
const DialogHeader = (props: DialogHeader) => {
  return (
    <header class={styles.DialogHeader}>
      <DialogCard isChatHeader={true} members={props.chat.members} ownId={props.ownId} />
    </header>
  )
}

export default DialogHeader

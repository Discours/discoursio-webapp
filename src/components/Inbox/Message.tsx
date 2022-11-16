import { clsx } from 'clsx'
import styles from './Message.module.scss'

type Props = {
  body: string
  isOwn: boolean
}

const Message = (props: Props) => {
  return (
    <div class={clsx(styles.Message, props.isOwn && styles.own)}>
      <div class={styles.body}>{props.body}</div>
    </div>
  )
}

export default Message

import { createSignal, Show } from 'solid-js'
import { clsx } from 'clsx'
import styles from './Message.module.scss'
import DialogAvatar from './DialogAvatar'
import type { Message as MessageType, ChatMember } from '../../graphql/types.gen'
import formattedTime from '../../utils/formatDateTime'
import { Icon } from '../_shared/Icon'
import { MessageActionsPopup } from './MessageActionsPopup'
import QuotedMessage from './QuotedMessage'

type Props = {
  content: MessageType
  ownId: number
  members: ChatMember[]
  replyClick?: () => void
  replyBody?: string
  replyAuthor?: string
}

export const Message = (props: Props) => {
  const isOwn = props.ownId === Number(props.content.author)
  const user = props.members?.find((m) => m.id === Number(props.content.author))
  const [isPopupVisible, setIsPopupVisible] = createSignal<boolean>(false)

  return (
    <div class={clsx(styles.Message, isOwn && styles.own)}>
      <Show when={!isOwn}>
        <div class={styles.author}>
          <DialogAvatar size="small" name={user.name} url={user.userpic} />
          <div class={styles.name}>{user.name}</div>
        </div>
      </Show>
      <div class={clsx(styles.body, { [styles.popupVisible]: isPopupVisible() })}>
        <div class={styles.text}>
          <div class={styles.actions}>
            <div onClick={props.replyClick}>
              <Icon name="chat-reply" class={styles.reply} />
            </div>
            <MessageActionsPopup
              onVisibilityChange={(isVisible) => setIsPopupVisible(isVisible)}
              trigger={<Icon name="menu" />}
            />
          </div>
          <Show when={props.replyBody}>
            <QuotedMessage body={props.replyBody} variant="inline" isOwn={isOwn} />
          </Show>
          <div innerHTML={props.content.body} />
        </div>
      </div>
      <div class={styles.time}>{formattedTime(props.content.createdAt * 1000)()}</div>
    </div>
  )
}

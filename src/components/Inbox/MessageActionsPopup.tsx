import { createEffect, createSignal, For } from 'solid-js'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'
import { t } from '../../utils/intl'
import { useInbox } from '../../context/inbox'

export type MessageActionType = 'reply' | 'copy' | 'pin' | 'forward' | 'select' | 'delete'

type MessageActionsPopup = {
  chatId: string
  messageId: number
} & Omit<PopupProps, 'children'>

const messageActions: { name: string; action: MessageActionType }[] = [
  { name: t('Reply'), action: 'reply' },
  { name: t('Copy'), action: 'copy' },
  { name: t('Pin'), action: 'pin' },
  // { name: t('Forward'), action: 'forward' },
  // { name: t('Select'), action: 'select' },
  { name: t('Delete'), action: 'delete' }
]

export const MessageActionsPopup = (props: MessageActionsPopup) => {
  const [selectedAction, setSelectedAction] = createSignal<MessageActionType | null>(null)

  const {
    actions: { deleteMessage }
  } = useInbox()

  createEffect(() => {
    switch (selectedAction()) {
      case 'delete':
        deleteMessage({ chatId: props.chatId, id: props.messageId })
        console.log('!!! asd:')
    }
  })
  return (
    <Popup {...props} variant="tiny">
      <ul class="nodash">
        <For each={messageActions}>
          {(item) => (
            <li
              style={item.action === 'delete' && { color: 'red' }}
              onClick={() => setSelectedAction(item.action)}
            >
              {item.name}
            </li>
          )}
        </For>
      </ul>
    </Popup>
  )
}

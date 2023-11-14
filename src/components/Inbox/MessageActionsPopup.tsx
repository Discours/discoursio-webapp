import type { PopupProps } from '../_shared/Popup'

import { createEffect, createSignal, For } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { Popup } from '../_shared/Popup'

export type MessageActionType = 'reply' | 'copy' | 'pin' | 'forward' | 'select' | 'delete'

type MessageActionsPopupProps = {
  actionSelect?: (selectedAction) => void
} & Omit<PopupProps, 'children'>

export const MessageActionsPopup = (props: MessageActionsPopupProps) => {
  const [selectedAction, setSelectedAction] = createSignal<MessageActionType | null>(null)
  const { t } = useLocalize()
  const actions: { name: string; action: MessageActionType }[] = [
    { name: t('Reply'), action: 'reply' },
    { name: t('Copy'), action: 'copy' },
    { name: t('Pin'), action: 'pin' },
    { name: t('Forward'), action: 'forward' },
    { name: t('Select'), action: 'select' },
    { name: t('Delete'), action: 'delete' },
  ]
  createEffect(() => {
    if (props.actionSelect) props.actionSelect(selectedAction())
  })
  return (
    <Popup {...props} variant="tiny">
      <ul class="nodash">
        <For each={actions}>
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

import { createEffect, createSignal, For } from 'solid-js'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'
import { t } from '../../utils/intl'

type MessageActionsPopup = {
  actionSelect?: (selectedAction) => void
} & Omit<PopupProps, 'children'>

const actions = [
  { name: t('Reply'), action: 'reply' },
  { name: t('Copy'), action: 'copy' },
  { name: t('Pin'), action: 'pin' },
  { name: t('Forward'), action: 'forward' },
  { name: t('Select'), action: 'select' },
  { name: t('Delete'), action: 'delete' }
]

export const MessageActionsPopup = (props: MessageActionsPopup) => {
  const [selectedAction, setSelectedAction] = createSignal<string>()
  createEffect(() => {
    if (props.actionSelect) props.actionSelect(selectedAction())
  })
  return (
    <Popup {...props} variant="tiny">
      <ul class="nodash">
        <For each={actions}>
          {(item) => <li onClick={() => setSelectedAction(item.action)}>{item.name}</li>}
        </For>
      </ul>
    </Popup>
  )
}

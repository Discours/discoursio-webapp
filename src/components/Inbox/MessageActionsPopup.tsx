import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'

type MessageActionsPopup = Omit<PopupProps, 'children'>

export const MessageActionsPopup = (props: MessageActionsPopup) => {
  return (
    <Popup {...props}>
      <ul class="nodash">
        <li>Ответить</li>
        <li>Скопировать</li>
        <li>Закрепить</li>
        <li>Переслать</li>
        <li>Выбрать</li>
        <li>Удалить</li>
      </ul>
    </Popup>
  )
}

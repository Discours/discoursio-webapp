import styles from './Popup.module.scss'
import { Popup, PopupProps } from './Popup'
import { useAuthStore } from '../../stores/auth'

type ProfilePopupProps = Omit<PopupProps, 'children'>

export const ProfilePopup = (props: ProfilePopupProps) => {
  const { session } = useAuthStore()

  return (
    <Popup {...props}>
      <ul class="nodash">
        <li>
          <a href={`/${session().user?.slug}`}>Профиль</a>
        </li>
        <li>
          <a href="#">Черновики</a>
        </li>
        <li>
          <a href="#">Подписки</a>
        </li>
        <li>
          <a href="#">Комментарии</a>
        </li>
        <li>
          <a href="#">Закладки</a>
        </li>
        <li>
          <a href="#">Настройки</a>
        </li>
        <li>
          <a href="#">Выйти из&nbsp;аккаунта</a>
        </li>
      </ul>
    </Popup>
  )
}

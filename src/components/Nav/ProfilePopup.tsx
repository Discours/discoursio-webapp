import { Popup, PopupProps } from './Popup'
import { signOut, useAuthStore } from '../../stores/auth'
import styles from './Popup.module.scss'

type ProfilePopupProps = Omit<PopupProps, 'children'>

export const ProfilePopup = (props: ProfilePopupProps) => {
  const { session } = useAuthStore()

  return (
    <Popup {...props} horizontalAnchor="right">
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
        <li class={styles.topBorderItem}>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              signOut()
            }}
          >
            Выйти из&nbsp;аккаунта
          </a>
        </li>
      </ul>
    </Popup>
  )
}

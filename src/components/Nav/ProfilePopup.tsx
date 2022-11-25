import { useSession } from '../../context/session'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'
import styles from '../_shared/Popup/Popup.module.scss'
import { getPagePath } from '@nanostores/router'
import { router } from '../../stores/router'

type ProfilePopupProps = Omit<PopupProps, 'children'>

export const ProfilePopup = (props: ProfilePopupProps) => {
  const {
    userSlug,
    actions: { signOut }
  } = useSession()

  return (
    <Popup {...props} horizontalAnchor="right">
      {/*TODO: l10n*/}
      <ul class="nodash">
        <li>
          <a href={getPagePath(router, 'author', { slug: userSlug() })}>Профиль</a>
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
          <a href={getPagePath(router, 'profileSettings')}>Настройки</a>
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

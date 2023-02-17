import { useSession } from '../../context/session'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'
import styles from '../_shared/Popup/Popup.module.scss'
import { getPagePath } from '@nanostores/router'
import { router } from '../../stores/router'
import { useLocalize } from '../../context/localize'

type ProfilePopupProps = Omit<PopupProps, 'children'>

export const ProfilePopup = (props: ProfilePopupProps) => {
  const {
    userSlug,
    actions: { signOut }
  } = useSession()

  const { t, lang } = useLocalize()

  return (
    <Popup {...props} horizontalAnchor="right" variant="bordered">
      <ul class="nodash">
        <li>
          <a href={getPagePath(router, 'author', { slug: userSlug(), lang: lang() } as never)}>
            {t('Profile')}
          </a>
        </li>
        <li>
          <a href="#">{t('Drafts')}</a>
        </li>
        <li>
          <a href="#">{t('Subscriptions')}</a>
        </li>
        <li>
          <a href="#">{t('Comments')}</a>
        </li>
        <li>
          <a href="#">{t('Bookmarks')}</a>
        </li>
        <li>
          <a href={getPagePath(router, 'profileSettings')}>{t('Settings')}</a>
        </li>
        <li class={styles.topBorderItem}>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              signOut()
            }}
          >
            {t('Logout')}
          </a>
        </li>
      </ul>
    </Popup>
  )
}

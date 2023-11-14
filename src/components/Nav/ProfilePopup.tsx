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
    user,
    actions: { signOut },
  } = useSession()

  const { t } = useLocalize()

  return (
    <Popup {...props} horizontalAnchor="right" variant="bordered">
      <ul class="nodash">
        <li>
          <a href={getPagePath(router, 'author', { slug: user().slug })}>{t('Profile')}</a>
        </li>
        <li>
          <a href={getPagePath(router, 'drafts')}>{t('Drafts')}</a>
        </li>
        <li>
          <a href={`${getPagePath(router, 'author', { slug: user().slug })}?modal=following`}>
            {t('Subscriptions')}
          </a>
        </li>
        <li>
          <a href={`${getPagePath(router, 'authorComments', { slug: user().slug })}`}>{t('Comments')}</a>
        </li>
        <li>
          <a href="#">{t('Bookmarks')}</a>
        </li>
        <li>
          <a href={getPagePath(router, 'profileSettings')}>{t('Settings')}</a>
        </li>
        <li class={styles.topBorderItem}>
          <span class="link" onClick={() => signOut()}>
            {t('Logout')}
          </span>
        </li>
      </ul>
    </Popup>
  )
}

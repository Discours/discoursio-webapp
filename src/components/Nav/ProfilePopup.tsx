import type { PopupProps } from '../_shared/Popup'

import { getPagePath } from '@nanostores/router'

import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'
import { router } from '../../stores/router'
import { Popup } from '../_shared/Popup'

import styles from '../_shared/Popup/Popup.module.scss'

type ProfilePopupProps = Omit<PopupProps, 'children'>

export const ProfilePopup = (props: ProfilePopupProps) => {
  const {
    author,
    actions: { signOut },
  } = useSession()

  const { t } = useLocalize()

  return (
    <Popup {...props} horizontalAnchor="right" variant="bordered">
      <ul class="nodash">
        <li>
          <a href={getPagePath(router, 'author', { slug: author().slug })}>{t('Profile')}</a>
        </li>
        <li>
          <a href={getPagePath(router, 'drafts')}>{t('Drafts')}</a>
        </li>
        <li>
          <a href={`${getPagePath(router, 'author', { slug: author().slug })}?modal=following`}>
            {t('Subscriptions')}
          </a>
        </li>
        <li>
          <a href={`${getPagePath(router, 'authorComments', { slug: author().slug })}`}>{t('Comments')}</a>
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

import { useSession } from '../../context/session'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'
import styles from '../_shared/Popup/Popup.module.scss'
import { getPagePath, openPage } from '@nanostores/router'
import { router, useRouter } from '../../stores/router'
import { useLocalize } from '../../context/localize'
import type { AuthorPageSearchParams } from '../Views/Author'

type ProfilePopupProps = Omit<PopupProps, 'children'>

export const ProfilePopup = (props: ProfilePopupProps) => {
  const {
    userSlug,
    actions: { signOut }
  } = useSession()

  const { t } = useLocalize()
  const { changeSearchParam } = useRouter<AuthorPageSearchParams>()

  const openAuthorComments = () => {
    openPage(router, 'author', { slug: userSlug() })
    changeSearchParam('by', 'commented')
  }

  return (
    <Popup {...props} horizontalAnchor="right" variant="bordered">
      <ul class="nodash">
        <li>
          <a href={getPagePath(router, 'author', { slug: userSlug() })}>{t('Profile')}</a>
        </li>
        <li>
          <a href="#">{t('Drafts')}</a>
        </li>
        <li>
          <a href="#">{t('Subscriptions')}</a>
        </li>
        <li>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              openAuthorComments()
            }}
          >
            {t('Comments')}
          </a>
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

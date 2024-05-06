import type { PopupProps } from '../_shared/Popup'

import { getPagePath } from '@nanostores/router'

import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'
import { router } from '../../stores/router'
import { Popup } from '../_shared/Popup'
import { Icon } from '../_shared/Icon'

import styles from '../_shared/Popup/Popup.module.scss'
import {clsx} from 'clsx';

type ProfilePopupProps = Omit<PopupProps, 'children'>

export const ProfilePopup = (props: ProfilePopupProps) => {
  const { author, signOut } = useSession()
  const { t } = useLocalize()

  return (
    <Popup {...props} horizontalAnchor="right" variant="bordered">
      <ul class="nodash">
        <li>
          <a class={styles.action} href={getPagePath(router, 'author', { slug: author().slug })}>
            <Icon name="profile" class={styles.icon}/>
            {t('Profile')}
          </a>
        </li>
        <li>
          <a class={styles.action} href={getPagePath(router, 'drafts')}>
            <Icon name="pencil-outline" class={styles.icon}/>
            {t('Drafts')}
          </a>
        </li>
        <li>
          <a class={styles.action} href={`${getPagePath(router, 'author', { slug: author().slug })}?m=following`}>
            <Icon name="feed-all" class={styles.icon}/>
            {t('Subscriptions')}
          </a>
        </li>
        <li>
          <a class={styles.action} href={`${getPagePath(router, 'authorComments', { slug: author().slug })}`}>
            <Icon name="comment" class={styles.icon}/>
            {t('Comments')}
          </a>
        </li>
        <li>
          <a class={styles.action} href="#">
            <Icon name="bookmark" class={styles.icon}/>
            {t('Bookmarks')}
          </a>
        </li>
        <li>
          <a class={styles.action} href={getPagePath(router, 'profileSettings')}>
            <Icon name="settings" class={styles.icon}/>
            {t('Settings')}
          </a>
        </li>
        <li class={styles.topBorderItem}>
          <span class={clsx(styles.action, 'link')} onClick={() => signOut()}>
            <Icon name="logout" class={styles.icon}/>
            {t('Logout')}
          </span>
        </li>
      </ul>
    </Popup>
  )
}

import { clsx } from 'clsx'

import { useLocalize } from '../../../context/localize'

import { useLocation } from '@solidjs/router'
import styles from './ProfileSettingsNavigation.module.scss'

export const ProfileSettingsNavigation = () => {
  const { t } = useLocalize()
  const loc = useLocation()
  return (
    <>
      <h4 class={styles.navigationHeader}>{t('Settings')}</h4>
      <ul class={clsx(styles.navigation, 'nodash')}>
        <li class={clsx({ [styles.active]: loc?.pathname === '/profile/settings' })}>
          <a href="/profile/settings">{t('Profile')}</a>
        </li>
        <li class={clsx({ [styles.active]: loc?.pathname === '/profile/subscriptions' })}>
          <a href="/profile/subscriptions">{t('Subscriptions')}</a>
        </li>
        <li class={clsx({ [styles.active]: loc?.pathname === '/profile/security' })}>
          <a href="/profile/security">{t('Security')}</a>
        </li>
      </ul>
    </>
  )
}

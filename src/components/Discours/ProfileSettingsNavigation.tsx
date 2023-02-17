import styles from './ProfileSettingsNavigation.module.scss'
import { clsx } from 'clsx'
import { useLocalize } from '../../context/localize'

export default () => {
  const { t } = useLocalize()
  return (
    <>
      <h4 class={styles.navigationHeader}>{t('Settings')}</h4>
      <ul class={clsx(styles.navigation, 'nodash')}>
        <li>
          <a href="/profile/settings">{t('Profile')}</a>
        </li>
        <li>
          <a href="/profile/subscriptions">{t('Subscriptions')}</a>
        </li>
        <li>
          <a href="/profile/security">{t('Security')}</a>
        </li>
      </ul>
    </>
  )
}

import styles from './ProfileSettingsNavigation.module.scss'
import { clsx } from 'clsx'
import { useLocalize } from '../../../context/localize'
import { useRouter } from '../../../stores/router'

export const ProfileSettingsNavigation = () => {
  const { t } = useLocalize()
  const { page } = useRouter()
  return (
    <>
      <h4 class={styles.navigationHeader}>{t('Settings')}</h4>
      <ul class={clsx(styles.navigation, 'nodash')}>
        <li class={clsx({ [styles.active]: page().route === 'profileSettings' })}>
          <a href="/profile/settings">{t('Profile')}</a>
        </li>
        <li class={clsx({ [styles.active]: page().route === 'profileSubscriptions' })}>
          <a href="/profile/subscriptions">{t('Subscriptions')}</a>
        </li>
        <li class={clsx({ [styles.active]: page().route === 'profileSecurity' })}>
          <a href="/profile/security">{t('Security')}</a>
        </li>
      </ul>
    </>
  )
}

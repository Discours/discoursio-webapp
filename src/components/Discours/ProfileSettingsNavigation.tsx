import styles from './ProfileSettingsNavigation.module.scss'
import { clsx } from 'clsx'

export default () => {
  return (
    <>
      <h4 class={styles.navigationHeader}>Настройки</h4>
      <ul class={clsx(styles.navigation, 'nodash')}>
        <li>
          <a href="/profile/settings">Профиль</a>
        </li>
        <li>
          <a href="/profile/subscriptions">Подписки</a>
        </li>
        <li>
          <a href="/profile/security">Вход и&nbsp;безопасность</a>
        </li>
      </ul>
    </>
  )
}

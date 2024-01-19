import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { Icon } from '../../_shared/Icon'

import styles from './SocialProviders.module.scss'

type Provider = 'facebook' | 'google' | 'github' // 'vk' | 'telegram'

export const SocialProviders = () => {
  const { t } = useLocalize()
  const {
    actions: { oauth },
  } = useSession()

  return (
    <div className={styles.container}>
      <div className={styles.text}>{t('or sign in with social networks')}</div>
      <div className={styles.social}>
        <a href="#" onClick={(_e) => oauth('google')}>
          <Icon name={'google'} />
        </a>
        <a href="#" onClick={(_e) => oauth('facebook')}>
          <Icon name={'facebook'} />
        </a>
        <a href="#" class={styles.githubAuth} onClick={(_e) => oauth('github')}>
          <Icon name="github" />
        </a>
      </div>
    </div>
  )
}

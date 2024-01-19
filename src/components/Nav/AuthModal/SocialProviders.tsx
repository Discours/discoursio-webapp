import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { Icon } from '../../_shared/Icon'

import styles from './SocialProviders.module.scss'

type Provider = 'facebook' | 'google' | 'github' // 'vk' | 'telegram'

export const SocialProviders = () => {
  const { t } = useLocalize()
  const {
    actions: { oauthLogin },
  } = useSession()

  const handleClick = async (event: MouseEvent | TouchEvent, provider: Provider): Promise<void> => {
    event.preventDefault()
    await oauthLogin(provider)
  }

  return (
    <div className={styles.container}>
      <div className={styles.text}>{t('or sign in with social networks')}</div>
      <div className={styles.social}>
        <a href="#" onClick={(ev) => handleClick(ev, 'google')}>
          <Icon name={'google'} />
        </a>
        <a href="#" onClick={(ev) => handleClick(ev, 'facebook')}>
          <Icon name={'facebook'} />
        </a>
        <a href="#" class={styles.githubAuth} onClick={(ev) => handleClick(ev, 'github')}>
          <Icon name="github" />
        </a>
      </div>
    </div>
  )
}

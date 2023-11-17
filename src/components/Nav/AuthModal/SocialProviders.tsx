import { useLocalize } from '../../../context/localize'
import { hideModal } from '../../../stores/ui'
import { apiBaseUrl } from '../../../utils/config'
import { Icon } from '../../_shared/Icon'

import styles from './SocialProviders.module.scss'

type Provider = 'facebook' | 'google' | 'vk' | 'github'

// 3rd party provider auth handler
const handleSocialAuthLinkClick = (event: MouseEvent, provider: Provider): void => {
  event.preventDefault()
  const popup = window.open(`${apiBaseUrl}/oauth/${provider}`, provider, 'width=740, height=420')
  popup?.focus()
  hideModal()
}

export const SocialProviders = () => {
  const { t } = useLocalize()
  return (
    <div class={styles.container}>
      <div class={styles.text}>{t('or sign in with social networks')}</div>
      <div class={styles.social}>
        <a href="#" onClick={(event) => handleSocialAuthLinkClick(event, 'facebook')}>
          <Icon name="facebook" />
        </a>
        <a href="#" onClick={(event) => handleSocialAuthLinkClick(event, 'google')}>
          <Icon name="google" />
        </a>
        <a href="#" onClick={(event) => handleSocialAuthLinkClick(event, 'vk')}>
          <Icon name="vk" />
        </a>
        <a
          href="#"
          class={styles.githubAuth}
          onClick={(event) => handleSocialAuthLinkClick(event, 'github')}
        >
          <Icon name="github" />
        </a>
      </div>
    </div>
  )
}

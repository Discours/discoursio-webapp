import { t } from '../../../utils/intl'
import { Icon } from '../Icon'
import { hideModal } from '../../../stores/ui'

import styles from './SocialProviders.module.scss'
import { apiBaseUrl } from '../../../utils/config'

type Provider = 'facebook' | 'google' | 'vk' | 'github'

// 3rd party provider auth handler
const handleSocialAuthLinkClick = (event: MouseEvent, provider: Provider): void => {
  event.preventDefault()
  const popup = window.open(`${apiBaseUrl}/oauth/${provider}`, provider, 'width=740, height=420')
  popup?.focus()
  hideModal()
}

export const SocialProviders = () => {
  return (
    <div class={styles.container}>
      <div class={styles.text}>{t('Or continue with social network')}</div>
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

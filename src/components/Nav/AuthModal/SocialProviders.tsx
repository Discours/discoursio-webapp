import { Icon } from '../../_shared/Icon'
import { hideModal } from '../../../stores/ui'

import styles from './SocialProviders.module.scss'
import { apiBaseUrl } from '../../../utils/config'
import { useLocalize } from '../../../context/localize'
import { setToken } from '../../../graphql/privateGraphQLClient'
import { useSession } from '../../../context/session'

type Provider = 'facebook' | 'google' | 'vk' | 'github'

// 3rd party provider auth handler
export const SocialProviders = () => {
  const { t } = useLocalize()
  const {
    actions: { loadSession }
  } = useSession()

  const handleSocialAuthLinkClick = (event: MouseEvent, provider: Provider): void => {
    event.preventDefault()
    const popup = window.open(`${apiBaseUrl}/oauth/${provider}`, provider, 'popup, width=740, height=420')

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer)
        loadSession()
        hideModal()
      }
    }, 1000)

    setTimeout(() => clearInterval(timer), 1000 * 60 * 5)
  }

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

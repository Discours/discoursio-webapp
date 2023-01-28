import { Icon } from '../_shared/Icon'
import { t } from '../../utils/intl'
import { createSocialShare, TWITTER, VK, FACEBOOK, TELEGRAM } from '@solid-primitives/share'

import styles from '../_shared/Popup/Popup.module.scss'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'

type SharePopupProps = {
  title: string
  imageUrl: string
  description: string
} & Omit<PopupProps, 'children'>

export const SharePopup = (props: SharePopupProps) => {
  const [share] = createSocialShare(() => ({
    title: props.title,
    url: props.imageUrl,
    description: props.description
  }))

  return (
    <Popup {...props} variant="bordered">
      <ul class="nodash">
        <li>
          <button role="button" onClick={() => share(VK)}>
            <Icon name="vk-white" class={styles.icon} />
            VK
          </button>
        </li>
        <li>
          <button role="button" onClick={() => share(FACEBOOK)}>
            <Icon name="facebook-white" class={styles.icon} />
            Facebook
          </button>
        </li>
        <li>
          <button role="button" onClick={() => share(TWITTER)}>
            <Icon name="twitter-white" class={styles.icon} />
            Twitter
          </button>
        </li>
        <li>
          <button role="button" onClick={() => share(TELEGRAM)}>
            <Icon name="telegram-white" class={styles.icon} />
            Telegram
          </button>
        </li>
        <li>
          <a href="#">
            <Icon name="link-white" class={styles.icon} />
            {t('Copy link')}
          </a>
        </li>
      </ul>
    </Popup>
  )
}

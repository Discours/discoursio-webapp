import { Icon } from '../_shared/Icon'
import { t } from '../../utils/intl'

import styles from '../_shared/Popup/Popup.module.scss'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'

type SharePopupProps = Omit<PopupProps, 'children'>

export const SharePopup = (props: SharePopupProps) => {
  return (
    <Popup {...props} variant="bordered">
      <ul class="nodash">
        <li>
          <a href="#">
            <Icon name="vk-white" class={styles.icon} />
            VK
          </a>
        </li>
        <li>
          <a href="#">
            <Icon name="facebook-white" class={styles.icon} />
            Facebook
          </a>
        </li>
        <li>
          <a href="#">
            <Icon name="twitter-white" class={styles.icon} />
            Twitter
          </a>
        </li>
        <li>
          <a href="#">
            <Icon name="telegram-white" class={styles.icon} />
            Telegram
          </a>
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

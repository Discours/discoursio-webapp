import { Icon } from '../_shared/Icon'

import { createSocialShare, TWITTER, VK, FACEBOOK, TELEGRAM } from '@solid-primitives/share'
import styles from '../_shared/Popup/Popup.module.scss'
import type { PopupProps } from '../_shared/Popup'
import { Popup } from '../_shared/Popup'
import { useLocalize } from '../../context/localize'
import { createEffect } from 'solid-js'

type SharePopupProps = {
  title: string
  shareUrl?: string
  imageUrl: string
  description: string
  isVisible: (value: boolean) => void
} & Omit<PopupProps, 'children'>

export const getShareUrl = (params: { pathname?: string } = {}) => {
  if (typeof location === 'undefined') return ''
  const pathname = params.pathname ?? location.pathname
  return location.origin + pathname
}

export const SharePopup = (props: SharePopupProps) => {
  const { t } = useLocalize()
  const [share] = createSocialShare(() => ({
    title: props.title,
    url: props.shareUrl,
    description: props.description
  }))
  const copyLink = async () => {
    await navigator.clipboard.writeText(props.shareUrl)
  }

  return (
    <Popup {...props} variant="bordered" onVisibilityChange={(value) => props.isVisible(value)}>
      <ul class="nodash">
        <li>
          <button role="button" class={styles.shareControl} onClick={() => share(VK)}>
            <Icon name="vk-white" class={styles.icon} />
            VK
          </button>
        </li>
        <li>
          <button role="button" class={styles.shareControl} onClick={() => share(FACEBOOK)}>
            <Icon name="facebook-white" class={styles.icon} />
            Facebook
          </button>
        </li>
        <li>
          <button role="button" class={styles.shareControl} onClick={() => share(TWITTER)}>
            <Icon name="twitter-white" class={styles.icon} />
            Twitter
          </button>
        </li>
        <li>
          <button role="button" class={styles.shareControl} onClick={() => share(TELEGRAM)}>
            <Icon name="telegram-white" class={styles.icon} />
            Telegram
          </button>
        </li>
        <li>
          <button role="button" class={styles.shareControl} onClick={copyLink}>
            <Icon name="link-white" class={styles.icon} />
            {t('Copy link')}
          </button>
        </li>
      </ul>
    </Popup>
  )
}

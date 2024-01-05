import { getPagePath } from '@nanostores/router'
import { createSocialShare, FACEBOOK, TELEGRAM, TWITTER, VK } from '@solid-primitives/share'
import { Input } from '@thisbeyond/solid-select'
import { clsx } from 'clsx'
import { createSignal, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSnackbar } from '../../../context/snackbar'
import { router } from '../../../stores/router'
import { Icon } from '../Icon'
import { Popover } from '../Popover'

import styles from './ShareLinks.module.scss'

type Props = {
  title: string
  description: string
  shareUrl: string
  imageUrl?: string
  class?: string
  variant: 'inModal' | 'inPopup'
}

export const ShareLinks = (props: Props) => {
  const { t } = useLocalize()
  const [isLinkCopied, setIsLinkCopied] = createSignal(false)
  const {
    actions: { showSnackbar },
  } = useSnackbar()

  const [share] = createSocialShare(() => ({
    title: props.title,
    url: props.shareUrl,
    description: props.description,
  }))
  const copyLink = async () => {
    await navigator.clipboard.writeText(props.shareUrl)
    if (props.variant === 'inModal') {
      setIsLinkCopied(true)
      setTimeout(() => setIsLinkCopied(false), 3000)
    } else {
      showSnackbar({ body: t('Link copied') })
    }
  }

  return (
    <div class={clsx(styles.ShareLinks, props.class, { [styles.inModal]: props.variant === 'inModal' })}>
      <ul class="nodash">
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
          <button role="button" class={styles.shareControl} onClick={() => share(VK)}>
            <Icon name="vk-white" class={styles.icon} />
            VK
          </button>
        </li>
        <li>
          <Show
            when={props.variant === 'inModal'}
            fallback={
              <button role="button" class={styles.shareControl} onClick={copyLink}>
                <Icon name="link-white" class={styles.icon} />
                {t('Copy link')}
              </button>
            }
          >
            <form class={clsx('pretty-form__item', styles.linkInput)}>
              <input type="text" name="link" readonly value={props.shareUrl} />
              <label for="link">{t('Copy link')}</label>

              <Popover content={t('Copy link')}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.copyButton} onClick={copyLink} ref={triggerRef}>
                    <Icon name="copy" class={styles.icon} />
                  </div>
                )}
              </Popover>

              <Show when={isLinkCopied()}>
                <div class={styles.isCopied}>{t('Link copied to clipboard')}</div>
              </Show>
            </form>
          </Show>
        </li>
      </ul>
    </div>
  )
}

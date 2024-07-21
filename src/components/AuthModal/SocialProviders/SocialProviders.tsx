import { For } from 'solid-js'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { Icon } from '../../_shared/Icon'
import styles from './SocialProviders.module.scss'

export const PROVIDERS = ['facebook', 'google', 'github'] // 'vk' | 'telegram'

export const SocialProviders = () => {
  const { t } = useLocalize()
  const { oauth } = useSession()

  return (
    <div class={styles.container}>
      <div class={styles.text}>{t('or sign in with social networks')}</div>
      <div class={styles.social}>
        <For each={PROVIDERS}>
          {(provider) => (
            <button
              type="button"
              class={styles[provider as keyof typeof styles]}
              onClick={(_e) => oauth(provider)}
            >
              <Icon name={provider} />
            </button>
          )}
        </For>
      </div>
    </div>
  )
}

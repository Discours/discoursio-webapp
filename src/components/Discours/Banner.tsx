import { clsx } from 'clsx'

import { useLocalize } from '~/context/localize'
import { useUI } from '~/context/ui'
import { Image } from '../_shared/Image'

import styles from './Banner.module.scss'

export default () => {
  const { t } = useLocalize()
  const { showModal } = useUI()
  return (
    <div class={styles.discoursBanner}>
      <div class="wide-container">
        <div class="row">
          <div class={clsx(styles.discoursBannerContent, 'col-lg-10')}>
            <h3>{t('Discours exists because of our common effort')}</h3>
            <p>
              <a href="/support">{t('Support us')}</a>
              <a href="/edit/new">{t('Become an author')}</a>
              <a href={''} onClick={() => showModal('auth')}>
                {t('Join the community')}
              </a>
            </p>
          </div>
          <div class={clsx(styles.discoursBannerImage, 'col-lg-12 offset-lg-2')}>
            <Image src="production/image/discours-banner.jpg" alt={t('Discours')} width={600} />
          </div>
        </div>
      </div>
    </div>
  )
}

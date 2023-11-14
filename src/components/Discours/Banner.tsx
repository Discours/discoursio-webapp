import { clsx } from 'clsx'

import { useLocalize } from '../../context/localize'
import { showModal } from '../../stores/ui'

import styles from './Banner.module.scss'

export default () => {
  const { t } = useLocalize()
  return (
    <div class={styles.discoursBanner}>
      <div class="wide-container">
        <div class="row">
          <div class={clsx(styles.discoursBannerContent, 'col-lg-10')}>
            <h3>{t('Discours is created with our common effort')}</h3>
            <p>
              <a href="/about/help">{t('Support us')}</a>
              <a href="/create">{t('Become an author')}</a>
              <a href={''} onClick={() => showModal('auth')}>
                {t('Join the community')}
              </a>
            </p>
          </div>
          <div class={clsx(styles.discoursBannerImage, 'col-lg-12 offset-lg-2')}>
            <img src="/discours-banner.jpg" alt={t('Discours')} />
          </div>
        </div>
      </div>
    </div>
  )
}

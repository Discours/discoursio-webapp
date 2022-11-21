import styles from './Banner.module.scss'
import { t } from '../../utils/intl'
import { showModal } from '../../stores/ui'
import { clsx } from 'clsx'

export default () => {
  return (
    <div class={styles.discoursBanner}>
      <div class="wide-container">
        <div class="row">
          <div class={clsx(styles.discoursBannerContent, 'col-lg-5')}>
            <h3>{t('Discours is created with our common effort')}</h3>
            <p>
              <a href="/about/help">{t('Support us')}</a>
              <a href="/create">{t('Become an author')}</a>
              <a href={''} onClick={() => showModal('auth')}>
                {t('Join the community')}
              </a>
            </p>
          </div>
          <div class={clsx(styles.discoursBannerImage, 'col-lg-6 offset-lg-1')}>
            <img src="/discours-banner.jpg" alt={t('Discours')} />
          </div>
        </div>
      </div>
    </div>
  )
}

import './Banner.scss'
import { t } from '../../utils/intl'
import { showModal } from '../../stores/ui'

export default () => {
  return (
    <div class="discours-banner">
      <div class="wide-container row">
        <div class="discours-banner__content col-lg-5">
          <h3>{t('Discours is created with our common effort')}</h3>
          <p>
            <a href="/about/help">{t('Support us')}</a>
            <a href="/create">{t('Become an author')}</a>
            <a href={''} onClick={() => showModal('auth')}>
              {t('Join the community')}
            </a>
          </p>
        </div>
        <div class="col-lg-6 offset-lg-1 discours-banner__image">
          <img src="/discours-banner.jpg" alt={t('Discours')} />
        </div>
      </div>
    </div>
  )
}

import './Hero.scss'

import { showModal } from '../../stores/ui'
import { useLocalize } from '../../context/localize'

export default () => {
  const { t } = useLocalize()
  return (
    <div class="about-discours">
      <div class="wide-container">
        <div class="row">
          <div class="col-lg-20 offset-lg-2 col-xl-16 offset-xl-4">
            <h4>{t('Horizontal collaborative journalistic platform')}</h4>
            <p>
              {t(
                'Discours is an intellectual environment, a web space and tools that allows authors to collaborate with readers and come together to co-create publications and media projects'
              )}
              .
              <br />
              <em>
                {t('We are convinced that one voice is good, but many is better') +
                  '. ' +
                  t('We create the most amazing stories together')}
                .
              </em>
            </p>
            <div class="about-discours__actions">
              <a class="button" onClick={() => showModal('auth')}>
                {t('Join the community')}
              </a>
              <a class="button" href="/create">
                {t('Become an author')}
              </a>
              <a class="button" href="/about/manifest">
                {t('About the project')}
              </a>
              <a class="button" href="/about/help">
                {t('Support us')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

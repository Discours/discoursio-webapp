import styles from './Hero.module.scss'

import { showModal } from '../../stores/ui'
import { useLocalize } from '../../context/localize'

export default () => {
  const { t } = useLocalize()
  return (
    <div class={styles.aboutDiscours}>
      <div class="wide-container">
        <div class="row">
          <div class="col-lg-20 offset-lg-2 col-xl-18 offset-xl-3">
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
            <div class={styles.aboutDiscoursActions}>
              <a class="button" href="/create">
                {t('Create post')}
              </a>
              <a class="button" onClick={() => showModal('auth')}>
                {t('Join the community')}
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

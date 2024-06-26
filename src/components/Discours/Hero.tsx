import { useLocalize } from '../../context/localize'
import { useRouter } from '../../stores/router'
import { showModal } from '../../stores/ui'
import type { AuthModalSearchParams } from '../Nav/AuthModal/types'

import styles from './Hero.module.scss'

export default () => {
  const { t } = useLocalize()
  const { changeSearchParams } = useRouter<AuthModalSearchParams>()

  return (
    <div class={styles.aboutDiscours}>
      <div class="wide-container">
        <div class="row">
          <div class="col-lg-20 offset-lg-2 col-xl-18 offset-xl-3">
            <h4 innerHTML={t('Horizontal collaborative journalistic platform')} />
            <p
              innerHTML={t(
                'Discours is an intellectual environment, a web space and tools that allows authors to collaborate with readers and come together to co-create publications and media projects',
              )}
            />
            <div class={styles.aboutDiscoursActions}>
              <a class="button" href="/create">
                {t('Create post')}
              </a>
              <a
                class="button"
                onClick={() => {
                  showModal('auth')
                  changeSearchParams({
                    mode: 'register',
                  })
                }}
              >
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

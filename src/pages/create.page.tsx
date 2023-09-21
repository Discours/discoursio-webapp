import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { Button } from '../components/_shared/Button'
import { Icon } from '../components/_shared/Icon'
import { clsx } from 'clsx'
import styles from '../styles/Create.module.scss'
import { apiClient } from '../utils/apiClient'
import { redirectPage } from '@nanostores/router'
import { router } from '../stores/router'
import { LayoutType } from './types'
import { AuthWrapper } from '../components/AuthWrapper'

const handleCreate = async (layout: LayoutType) => {
  const shout = await apiClient.createArticle({ article: { layout: layout } })
  redirectPage(router, 'edit', {
    shoutId: shout.id.toString()
  })
}

export const CreatePage = () => {
  const { t } = useLocalize()
  return (
    <PageLayout>
      <AuthWrapper>
        <article class={clsx('wide-container', 'container--static-page', styles.Create)}>
          <h1>{t('Choose a post type')}</h1>
          <ul class={clsx('nodash', styles.list)}>
            <li>
              <div class={styles.link} onClick={() => handleCreate('article')}>
                <Icon name="create-article" class={styles.icon} />
                <div>{t('article')}</div>
              </div>
            </li>
            <li>
              <div class={styles.link} onClick={() => handleCreate('literature')}>
                <Icon name="create-books" class={styles.icon} />
                <div>{t('literature')}</div>
              </div>
            </li>
            <li>
              <div class={styles.link} onClick={() => handleCreate('image')}>
                <Icon name="create-images" class={styles.icon} />
                <div>{t('images')}</div>
              </div>
            </li>
            <li>
              <div class={styles.link} onClick={() => handleCreate('audio')}>
                <Icon name="create-music" class={styles.icon} />
                <div>{t('music')}</div>
              </div>
            </li>
            <li>
              <div class={styles.link} onClick={() => handleCreate('video')}>
                <Icon name="create-video" class={styles.icon} />
                <div>{t('video')}</div>
              </div>
            </li>
          </ul>
          <Button value={t('Back')} onClick={() => window.history.back()} />
        </article>
      </AuthWrapper>
    </PageLayout>
  )
}

export const Page = CreatePage

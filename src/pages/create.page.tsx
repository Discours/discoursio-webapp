import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { Button } from '../components/_shared/Button'
import { Icon } from '../components/_shared/Icon'
import { clsx } from 'clsx'
import styles from '../styles/Create.module.scss'
import { apiClient } from '../utils/apiClient'
import { redirectPage } from '@nanostores/router'
import { router } from '../stores/router'

const handleCreateArticle = async () => {
  const shout = await apiClient.createArticle({ article: {} })
  redirectPage(router, 'edit', {
    type: 'article',
    shoutId: shout.id.toString()
  })
}

const handleCreateVideo = async () => {
  const shout = await apiClient.createArticle({ article: {} })
  redirectPage(router, 'edit', {
    type: 'video',
    shoutId: shout.id.toString()
  })
}

export const CreatePage = () => {
  const { t } = useLocalize()
  return (
    <PageLayout>
      <article class={clsx('wide-container', 'container--static-page', styles.Create)}>
        <h1>{t('Choose a post type')}</h1>
        <ul class={clsx('nodash', styles.list)}>
          <li>
            <div class={styles.link} onClick={handleCreateArticle}>
              <Icon name="create-article" class={styles.icon} />
              <div>{t('article')}</div>
            </div>
          </li>
          <li>
            <a href="#">
              <Icon name="create-books" class={styles.icon} />
              <div>{t('literature')}</div>
            </a>
          </li>
          <li>
            <a href="#">
              <Icon name="create-images" class={styles.icon} />
              <div>{t('images')}</div>
            </a>
          </li>
          <li>
            <a href="#">
              <Icon name="create-music" class={styles.icon} />
              <div>{t('music')}</div>
            </a>
          </li>
          <li>
            <div class={styles.link} onClick={handleCreateVideo}>
              <Icon name="create-video" class={styles.icon} />
              <div>{t('video')}</div>
            </div>
          </li>
        </ul>
        <Button value={t('Back')} onClick={() => window.history.back()} />
      </article>
    </PageLayout>
  )
}

export const Page = CreatePage

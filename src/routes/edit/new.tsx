import { Meta } from '@solidjs/meta'
import { useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'
import { createMemo } from 'solid-js'
import { AuthGuard } from '~/components/AuthGuard'
import { Button } from '~/components/_shared/Button'
import { Icon } from '~/components/_shared/Icon'
import { PageLayout } from '~/components/_shared/PageLayout'
import enKeywords from '~/config/locales/en/keywords.json'
import ruKeywords from '~/config/locales/ru/keywords.json'
import { useGraphQL } from '~/context/graphql'
import { useLocalize } from '~/context/localize'
import createShoutMutation from '~/graphql/mutation/core/article-create'
import styles from '~/styles/Create.module.scss'
import { LayoutType } from '~/types/common'
import { getImageUrl } from '~/utils/getImageUrl'

export default () => {
  const { t, lang } = useLocalize()
  const ogImage = getImageUrl('production/image/logo_image.png')
  const ogTitle = createMemo(() => t('Choose a post type'))
  const description = createMemo(() =>
    t('Participate in the Discours: share information, join the editorial team')
  )
  const client = useGraphQL()
  const navigate = useNavigate()
  const handleCreate = async (layout: LayoutType) => {
    const result = await client.mutation(createShoutMutation, { article: { layout: layout } }).toPromise()
    if (result) {
      const shout = result.data.create_shout
      if (shout?.id) navigate(`/edit/${shout.id}`)
    }
  }
  return (
    <PageLayout title={ogTitle()}>
      <Meta name="descprition" content={description()} />
      <Meta name="keywords" content={lang() === 'ru' ? ruKeywords[''] : enKeywords['']} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle()} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="og:description" content={description()} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle()} />
      <Meta name="twitter:description" content={description()} />
      <AuthGuard>
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
      </AuthGuard>
    </PageLayout>
  )
}

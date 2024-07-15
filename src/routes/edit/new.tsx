import { useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'
import { For } from 'solid-js'
import { AuthGuard } from '~/components/AuthGuard'
import { Button } from '~/components/_shared/Button'
import { Icon } from '~/components/_shared/Icon'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useGraphQL } from '~/context/graphql'
import { useLocalize } from '~/context/localize'
import createShoutMutation from '~/graphql/mutation/core/article-create'
import styles from '~/styles/Create.module.scss'
import { LayoutType } from '~/types/common'

export default () => {
  const { t } = useLocalize()
  const client = useGraphQL()
  const navigate = useNavigate()
  const handleCreate = async (layout: LayoutType) => {
    const result = await client.mutation(createShoutMutation, { shout: { layout: layout } }).toPromise()
    if (result) {
      const shout = result.data.create_shout
      if (shout?.id) navigate(`/edit/${shout.id}`)
    }
  }
  return (
    <PageLayout
      title={`${t('Discours')} :: ${t('Choose a post type')}`}
      key="home"
      desc="Participate in the Discours: share information, join the editorial team"
    >
      <AuthGuard>
        <article class={clsx('wide-container', 'container--static-page', styles.Create)}>
          <h1>{t('Choose a post type')}</h1>
          <ul class={clsx('nodash', styles.list)}>
            <For each={['Article', 'Literature', 'Image', 'Audio', 'Video']}>
              {(layout: string) => (
                <li>
                  <div class={styles.link} onClick={() => handleCreate(layout.toLowerCase() as LayoutType)}>
                    <Icon name={`create-${layout.toLowerCase()}`} class={styles.icon} />
                    <div>{t(layout)}</div>
                  </div>
                </li>
              )}
            </For>
          </ul>
          <Button value={t('Back')} onClick={() => window?.history.back()} />
        </article>
      </AuthGuard>
    </PageLayout>
  )
}

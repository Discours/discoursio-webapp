import { useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'
import { For } from 'solid-js'
import { AuthGuard } from '~/components/AuthGuard'
import { Button } from '~/components/_shared/Button'
import { Icon } from '~/components/_shared/Icon'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useEditorContext } from '~/context/editor'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useSnackbar } from '~/context/ui'
import createShoutMutation from '~/graphql/mutation/core/article-create'
import { LayoutType } from '~/types/common'

import styles from '~/styles/Create.module.scss'

export default () => {
  const { t } = useLocalize()
  const { client } = useSession()
  const { saveDraftToLocalStorage } = useEditorContext()

  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const handleCreate = async (layout: LayoutType) => {
    console.debug('[routes : edit/new] handling create click...')
    const result = await client()
      ?.mutation(createShoutMutation, { shout: { layout: layout } })
      .toPromise()
    if (result) {
      console.debug(result)
      const { shout, error } = result.data.create_shout
      if (error) {
        showSnackbar({
          body: `${t('Error')}: ${t(error)}`,
          type: 'error'
        })
        return
      }
      if (shout?.id) {
        saveDraftToLocalStorage({
          shoutId: shout.id,
          selectedTopics: shout.topics,
          slug: shout.slug,
          title: '',
          body: ''
        })
        navigate(`/edit/${shout.id}`)
      }
    }
  }
  return (
    <PageLayout
      title={`${t('Discours')} :: ${t('Choose a post type')}`}
      key="home"
      desc={t('Participate in the Discours: share information, join the editorial team')}
    >
      <AuthGuard>
        <article class={clsx('wide-container', 'container--static-page', styles.Create)}>
          <h1>{t('Choose a post type')}</h1>
          <ul class={clsx('nodash', styles.list)}>
            <For each={['Article', 'Literature', 'Image', 'Audio', 'Video']}>
              {(layout: string) => (
                <li onClick={() => handleCreate(layout.toLowerCase() as LayoutType)}>
                  <div class={styles.link}>
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

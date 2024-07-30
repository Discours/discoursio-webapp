import { RouteSectionProps, redirect } from '@solidjs/router'
import { createEffect, createMemo, createSignal, lazy, on } from 'solid-js'
import { AuthGuard } from '~/components/AuthGuard'
import { PageLayout } from '~/components/_shared/PageLayout'
import { coreApiUrl } from '~/config'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useSnackbar } from '~/context/ui'
import { graphqlClientCreate } from '~/graphql/client'
import getShoutDraft from '~/graphql/query/core/article-my'
import { Shout } from '~/graphql/schema/core.gen'
import { LayoutType } from '~/types/common'

const EditView = lazy(() => import('~/components/Views/EditView/EditView'))

export default (props: RouteSectionProps) => {
  const { t } = useLocalize()
  const { session } = useSession()
  const snackbar = useSnackbar()
  const fail = async (error: string) => {
    console.error(error)
    const errorMessage = error === 'forbidden' ? "You can't edit this post" : error
    await snackbar?.showSnackbar({ type: 'error', body: t(errorMessage) })
    redirect('/edit') // all drafts page
  }
  const [shout, setShout] = createSignal<Shout>()
  const client = createMemo(() => graphqlClientCreate(coreApiUrl, session()?.access_token))

  createEffect(on(session, (s) => s?.access_token && loadDraft(), { defer: true }))

  const loadDraft = async () => {
    const shout_id = Number.parseInt(props.params.id)
    const result = await client()?.query(getShoutDraft, { shout_id }).toPromise()
    if (result) {
      const { shout: loadedShout, error } = result.data.get_my_shout
      if (error) {
        fail(error)
      } else {
        setShout(loadedShout)
      }
    }
  }

  const title = createMemo(() => {
    const layout = (shout()?.layout as LayoutType) || 'article'
    if (!shout()) return 'Create post'
    return (
      {
        article: 'Write an article',
        audio: 'Publish Album',
        image: 'Create gallery',
        video: 'Create video',
        literature: 'New literary work'
      }[layout] || 'Write an article'
    )
  })

  return (
    <PageLayout title={`${t('Discours')} :: ${t(title())}`}>
      <AuthGuard>
        <EditView shout={shout() as Shout} />
      </AuthGuard>
    </PageLayout>
  )
}

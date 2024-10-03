import { RouteSectionProps, redirect } from '@solidjs/router'
import { createEffect, createMemo, createSignal, lazy, on } from 'solid-js'
import { AuthGuard } from '~/components/AuthGuard'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useSnackbar } from '~/context/ui'
import getShoutDraft from '~/graphql/query/core/article-my'
import { Shout } from '~/graphql/schema/core.gen'
import { LayoutType } from '~/types/common'

const EditView = lazy(() => import('~/components/Views/EditView'))

export default (props: RouteSectionProps) => {
  const { t } = useLocalize()
  const { session, client } = useSession()
  const snackbar = useSnackbar()
  const [shout, setShout] = createSignal<Shout>()

  createEffect(
    on(
      session,
      async (s) => {
        if (!s?.access_token) return
        const shout_id = Number.parseInt(props.params.id)
        const result = await client()?.query(getShoutDraft, { shout_id }).toPromise()
        if (result) {
          const { shout: loadedShout, error } = result.data.get_my_shout
          if (error) {
            console.error(error)
            const errorMessage = error === 'forbidden' ? "You can't edit this post" : error
            await snackbar?.showSnackbar({ type: 'error', body: t(errorMessage) })
            redirect('/edit') // all drafts page
          } else {
            setShout(loadedShout)
          }
        }
      },
      {}
    )
  )

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

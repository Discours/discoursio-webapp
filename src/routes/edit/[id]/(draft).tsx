import { useNavigate, useParams } from '@solidjs/router'
import { createEffect, createMemo, createSignal, lazy, on } from 'solid-js'
import { AuthGuard } from '~/components/AuthGuard'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useGraphQL } from '~/context/graphql'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useSnackbar } from '~/context/ui'
import getShoutDraft from '~/graphql/query/core/article-my'
import { Shout } from '~/graphql/schema/core.gen'
import { LayoutType } from '~/types/common'

const EditView = lazy(() => import('~/components/Views/EditView/EditView'))

export const getContentTypeTitle = (layout: LayoutType) => {
  switch (layout) {
    case 'audio':
      return 'Publish Album'
    case 'image':
      return 'Create gallery'
    case 'video':
      return 'Create video'
    case 'literature':
      return 'New literary work'
    default:
      return 'Write an article'
  }
}

export const EditPage = () => {
  const { t } = useLocalize()
  const { session } = useSession()
  const snackbar = useSnackbar()
  const navigate = useNavigate()
  const fail = async (error: string) => {
    console.error(error)
    const errorMessage = error === 'forbidden' ? "You can't edit this post" : error
    await snackbar?.showSnackbar({ type: 'error', body: t(errorMessage) })
    navigate('/edit')
  }
  const [shout, setShout] = createSignal<Shout>()
  const params = useParams()
  const client = useGraphQL()

  createEffect(on(session, (s) => s?.access_token && loadDraft(), { defer: true }))

  const loadDraft = async () => {
    const result = await client.query(getShoutDraft, { shout_id: params.id }).toPromise()
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
    if (!shout()) {
      return t('Create post')
    }
    return t(getContentTypeTitle(shout()?.layout as LayoutType))
  })

  return (
    <PageLayout title={`${t('Discours')} :: ${title()}`}>
      <AuthGuard>
        <EditView shout={shout() as Shout} />
      </AuthGuard>
    </PageLayout>
  )
}

export default EditPage

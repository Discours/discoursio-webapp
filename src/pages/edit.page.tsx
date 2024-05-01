import { Show, createEffect, createMemo, createSignal, lazy, on, onMount } from 'solid-js'

import { AuthGuard } from '../components/AuthGuard'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { useSession } from '../context/session'
import { apiClient } from '../graphql/client/core'
import { Shout } from '../graphql/schema/core.gen'
import { router } from '../stores/router'

import { redirectPage } from '@nanostores/router'
import { useSnackbar } from '../context/snackbar'
import { LayoutType } from './types'

const EditView = lazy(() => import('../components/Views/EditView/EditView'))

const getContentTypeTitle = (layout: LayoutType) => {
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

  const fail = async (error: string) => {
    console.error(error)
    await snackbar?.showSnackbar({ type: 'error', body: t(error) })
    redirectPage(router, 'drafts')
  }

  const [shoutId, setShoutId] = createSignal<number>(0)
  const [shout, setShout] = createSignal<Shout>()

  onMount(() => {
    const shoutId = window.location.pathname.split('/').pop()
    const shoutIdFromUrl = Number.parseInt(shoutId ?? '0', 10)
    console.debug(`editing shout ${shoutIdFromUrl}`)
    if (shoutIdFromUrl) setShoutId(shoutIdFromUrl)
  })

  createEffect(
    on([session, shout, shoutId], async ([ses, sh, shid]) => {
      if (ses?.user && !sh && shid) {
        const { shout: loadedShout, error } = await apiClient.getMyShout(shid)
        if (error) {
          fail(error)
        } else {
          setShout(loadedShout)
        }
      }
    }),
  )

  const title = createMemo(() => {
    if (!shout()) {
      return t('Create post')
    }
    return t(getContentTypeTitle(shout()?.layout as LayoutType))
  })

  return (
    <PageLayout title={title()}>
      <AuthGuard>
        <Show when={shout()} fallback={<Loading />}>
          <EditView shout={shout() as Shout} />
        </Show>
      </AuthGuard>
    </PageLayout>
  )
}

export const Page = EditPage

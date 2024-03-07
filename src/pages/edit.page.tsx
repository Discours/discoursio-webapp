import { Show, Suspense, createEffect, createMemo, createSignal, lazy, on, onMount } from 'solid-js'

import { AuthGuard } from '../components/AuthGuard'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { apiClient } from '../graphql/client/core'
import { Shout } from '../graphql/schema/core.gen'
import { useRouter } from '../stores/router'
import { router } from '../stores/router'

import { redirectPage } from '@nanostores/router'
import { useSnackbar } from '../context/snackbar'
import { LayoutType } from './types'

const EditView = lazy(() => import('../components/Views/EditView/EditView'))

export const EditPage = () => {
  const { page } = useRouter()
  const snackbar = useSnackbar()
  const { t } = useLocalize()

  const shoutId = createMemo(() => Number((page().params as Record<'shoutId', string>).shoutId))

  const [shout, setShout] = createSignal<Shout>(null)

  createEffect(
    on(shoutId, async (shout_id) => {
      const { shout: loadedShout, error } = await apiClient.getMyShout(shout_id)
      console.log(loadedShout)
      if (error) {
        await snackbar?.showSnackbar({ type: 'error', body: t('This content is not published yet') })
        redirectPage(router, 'drafts')
      } else {
        setShout(loadedShout)
      }
    }, { defer: true }),
  )

  const title = createMemo(() => {
    if (!shout()) {
      return t('Create post')
    }

    switch (shout().layout as LayoutType) {
      case 'audio': {
        return t('Publish Album')
      }
      case 'image': {
        return t('Create gallery')
      }
      case 'video': {
        return t('Create video')
      }
      case 'literature': {
        return t('New literary work')
      }
      default: {
        return t('Write an article')
      }
    }
  })

  return (
    <PageLayout title={title()}>
      <AuthGuard>
        <Show when={shout()}>
          <Suspense fallback={<Loading />}>
            <EditView shout={shout()} />
          </Suspense>
        </Show>
      </AuthGuard>
    </PageLayout>
  )
}

export const Page = EditPage

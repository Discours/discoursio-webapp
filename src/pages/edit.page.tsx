import { createMemo, createSignal, lazy, onMount, Show, Suspense } from 'solid-js'
import { PageLayout } from '../components/_shared/PageLayout'
import { Loading } from '../components/_shared/Loading'
import { useSession } from '../context/session'
import { Shout } from '../graphql/types.gen'
import { useRouter } from '../stores/router'
import { apiClient } from '../utils/apiClient'
import { useLocalize } from '../context/localize'
import { AuthGuard } from '../components/AuthGuard'

const Edit = lazy(() => import('../components/Views/Edit'))

export const EditPage = () => {
  const { page } = useRouter()

  const shoutId = createMemo(() => Number((page().params as Record<'shoutId', string>).shoutId))

  const [shout, setShout] = createSignal<Shout>(null)

  onMount(async () => {
    const loadedShout = await apiClient.getShoutById(shoutId())
    setShout(loadedShout)
  })

  return (
    <PageLayout>
      <AuthGuard>
        <Show when={shout()}>
          <Suspense fallback={<Loading />}>
            <Edit shout={shout()} />
          </Suspense>
        </Show>
      </AuthGuard>
    </PageLayout>
  )
}

export const Page = EditPage

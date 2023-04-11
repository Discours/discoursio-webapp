import { createMemo, createSignal, lazy, onMount, Show, Suspense } from 'solid-js'
import { PageLayout } from '../components/_shared/PageLayout'
import { Loading } from '../components/_shared/Loading'
import { useSession } from '../context/session'
import { Shout } from '../graphql/types.gen'
import { useRouter } from '../stores/router'
import { apiClient } from '../utils/apiClient'

const EditView = lazy(() => import('../components/Views/Edit'))

export const EditPage = () => {
  const { isAuthenticated, isSessionLoaded } = useSession()

  const { page } = useRouter()

  const shoutSlug = createMemo(() => (page().params as Record<'shoutSlug', string>).shoutSlug)

  const [shout, setShout] = createSignal<Shout>(null)

  onMount(async () => {
    const loadedShout = await apiClient.getShout(shoutSlug())
    setShout(loadedShout)
  })

  return (
    <PageLayout>
      <Show when={isSessionLoaded()}>
        <Show when={isAuthenticated()} fallback="Давайте авторизуемся">
          <Show when={shout()}>
            <Suspense fallback={<Loading />}>
              <EditView shout={shout()} />
            </Suspense>
          </Show>
        </Show>
      </Show>
    </PageLayout>
  )
}

export const Page = EditPage

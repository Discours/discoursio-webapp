import { lazy, Show, Suspense } from 'solid-js'
import { PageLayout } from '../components/_shared/PageLayout'
import { Loading } from '../components/_shared/Loading'
import { useSession } from '../context/session'

const CreateView = lazy(() => import('../components/Views/Create'))

export const CreatePage = () => {
  const { isAuthenticated, isSessionLoaded } = useSession()

  return (
    <PageLayout>
      <Show when={isSessionLoaded()}>
        <Show when={isAuthenticated()} fallback="Давайте авторизуемся">
          <Suspense fallback={<Loading />}>
            <CreateView />
          </Suspense>
        </Show>
      </Show>
    </PageLayout>
  )
}

export const Page = CreatePage

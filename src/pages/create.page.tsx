import { lazy, Suspense } from 'solid-js'
import { PageLayout } from '../components/_shared/PageLayout'
import { Loading } from '../components/_shared/Loading'

const CreateView = lazy(() => import('../components/Views/Create'))

export const CreatePage = () => {
  return (
    <PageLayout>
      <Suspense fallback={<Loading />}>
        <CreateView />
      </Suspense>
    </PageLayout>
  )
}

export const Page = CreatePage

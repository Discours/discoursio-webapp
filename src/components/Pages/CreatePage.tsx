import { lazy, Suspense } from 'solid-js'
import { MainLayout } from '../Layouts/MainLayout'
import { Loading } from '../Loading'

const CreateView = lazy(() => import('../Views/Create'))

export const CreatePage = () => {
  return (
    <MainLayout>
      <Suspense fallback={<Loading />}>
        <CreateView />
      </Suspense>
    </MainLayout>
  )
}

// for lazy loading
export default CreatePage

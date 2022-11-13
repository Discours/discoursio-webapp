import { lazy, Suspense } from 'solid-js'
import { PageWrap } from '../Wraps/PageWrap'
import { Loading } from '../Loading'

const CreateView = lazy(() => import('../Views/Create'))

export const CreatePage = () => {
  return (
    <PageWrap>
      <Suspense fallback={<Loading />}>
        <CreateView />
      </Suspense>
    </PageWrap>
  )
}

// for lazy loading
export default CreatePage

import { lazy, Suspense } from 'solid-js'
import { MainWrap } from '../Wrap/MainWrap'
import { Loading } from '../Loading'

const CreateView = lazy(() => import('../Views/Create'))

export const CreatePage = () => {
  return (
    <MainWrap>
      <Suspense fallback={<Loading />}>
        <CreateView />
      </Suspense>
    </MainWrap>
  )
}

// for lazy loading
export default CreatePage

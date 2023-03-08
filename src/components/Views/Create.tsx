import { lazy, Suspense } from 'solid-js'
import { Loading } from '../_shared/Loading'
import { useLocalize } from '../../context/localize'

const Editor = lazy(() => import('../Editor/Editor'))

export const CreateView = () => {
  const { t } = useLocalize()

  return (
    <Suspense fallback={<Loading />}>
      <Editor />
    </Suspense>
  )
}

export default CreateView

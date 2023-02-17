import { lazy, Suspense } from 'solid-js'
import { Loading } from '../_shared/Loading'
import { useLocalize } from '../../context/localize'

const Editor = lazy(() => import('../EditorNew/Editor'))

export const CreateView = () => {
  const { t } = useLocalize()

  const newArticleIpsum = `<h1>${t('Header')}</h1>
  <h2>${t('Subheader')}</h2>
  <p>${t('A short introduction to keep the reader interested')}</p>`

  return (
    <Suspense fallback={<Loading />}>
      <Editor initialContent={newArticleIpsum} />
    </Suspense>
  )
}

export default CreateView

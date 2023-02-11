import { lazy, Suspense } from 'solid-js'
import { t } from '../../utils/intl'
import { Loading } from '../Loading'

const Editor = lazy(() => import('../EditorNew/Editor'))

const newArticleIpsum = `<h1>${t('Header')}</h1>
    <h2>${t('Subheader')}</h2>
    <p>${t('A short introduction to keep the reader interested')}</p>`

export const CreateView = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Editor initialContent={newArticleIpsum} />
    </Suspense>
  )
}

export default CreateView

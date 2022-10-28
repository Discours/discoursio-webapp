import { MainLayout } from '../Layouts/MainLayout'
import { FeedView } from '../Views/Feed'
import { onCleanup } from 'solid-js'
import { resetSortedArticles } from '../../stores/zine/articles'

export const FeedPage = () => {
  onCleanup(() => resetSortedArticles())

  return (
    <MainLayout>
      <FeedView />
    </MainLayout>
  )
}

// for lazy loading
export default FeedPage

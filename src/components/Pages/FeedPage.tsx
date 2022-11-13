import { PageWrap } from '../Wraps/PageWrap'
import { FeedView } from '../Views/Feed'
import { onCleanup } from 'solid-js'
import { resetSortedArticles } from '../../stores/zine/articles'

export const FeedPage = () => {
  onCleanup(() => resetSortedArticles())

  return (
    <PageWrap>
      <FeedView />
    </PageWrap>
  )
}

// for lazy loading
export default FeedPage

import { MainWrap } from '../Wrap/MainWrap'
import { FeedView } from '../Views/Feed'
import { onCleanup } from 'solid-js'
import { resetSortedArticles } from '../../stores/zine/articles'

export const FeedPage = () => {
  onCleanup(() => resetSortedArticles())

  return (
    <MainWrap>
      <FeedView />
    </MainWrap>
  )
}

// for lazy loading
export default FeedPage

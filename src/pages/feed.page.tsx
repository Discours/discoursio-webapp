import { PageLayout } from '../components/_shared/PageLayout'
import { FeedView } from '../components/Views/Feed'
import { onCleanup } from 'solid-js'
import { resetSortedArticles } from '../stores/zine/articles'
import { ReactionsProvider } from '../context/reactions'

export const FeedPage = () => {
  onCleanup(() => resetSortedArticles())

  return (
    <PageLayout>
      <ReactionsProvider>
        <FeedView />
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = FeedPage

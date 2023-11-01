import { PageLayout } from '../components/_shared/PageLayout'
import { FeedView } from '../components/Views/Feed'
import { createEffect, Match, on, onCleanup, Switch } from 'solid-js'
import { loadMyFeed, loadShouts, resetSortedArticles } from '../stores/zine/articles'
import { ReactionsProvider } from '../context/reactions'
import { useRouter } from '../stores/router'
import { AuthGuard } from '../components/AuthGuard'
import { LoadShoutsOptions } from '../graphql/types.gen'

export const FeedPage = () => {
  onCleanup(() => resetSortedArticles())

  const { page } = useRouter()

  const handleFeedLoadShouts = (options: LoadShoutsOptions) => {
    return loadShouts({
      ...options,
      filters: { visibility: 'community' }
    })
  }

  const handleMyFeedLoadShouts = (options: LoadShoutsOptions) => {
    return loadMyFeed(options)
  }

  createEffect(
    on(
      () => page().route,
      () => {
        resetSortedArticles()
      },
      { defer: true }
    )
  )

  return (
    <PageLayout>
      <ReactionsProvider>
        <Switch fallback={<FeedView loadShouts={handleFeedLoadShouts} />}>
          <Match when={page().route === 'feed'}>
            <FeedView loadShouts={handleFeedLoadShouts} />
          </Match>
          <Match when={page().route === 'feedMy'}>
            <AuthGuard>
              <FeedView loadShouts={handleMyFeedLoadShouts} />
            </AuthGuard>
          </Match>
        </Switch>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = FeedPage

import { createEffect, Match, on, onCleanup, Switch } from 'solid-js'

import { PageLayout } from '../components/_shared/PageLayout'
import { AuthGuard } from '../components/AuthGuard'
import { Feed } from '../components/Views/Feed'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'
import { LoadShoutsOptions } from '../graphql/schema/core.gen'
import { useRouter } from '../stores/router'
import { loadMyFeed, loadShouts, resetSortedArticles } from '../stores/zine/articles'

const handleFeedLoadShouts = (options: LoadShoutsOptions) => {
  return loadShouts({
    ...options,
    filters: { published: false },
  })
}

const handleMyFeedLoadShouts = (options: LoadShoutsOptions) => {
  return loadMyFeed(options)
}

export const FeedPage = () => {
  const { t } = useLocalize()

  onCleanup(() => resetSortedArticles())

  const { page } = useRouter()

  createEffect(
    on(
      () => page().route,
      () => {
        resetSortedArticles()
      },
      { defer: true },
    ),
  )

  return (
    <PageLayout title={t('Feed')}>
      <ReactionsProvider>
        <Switch fallback={<Feed loadShouts={handleFeedLoadShouts} />}>
          <Match when={page().route === 'feed'}>
            <Feed loadShouts={handleFeedLoadShouts} />
          </Match>
          <Match when={page().route === 'feedMy'}>
            <AuthGuard>
              <Feed loadShouts={handleMyFeedLoadShouts} />
            </AuthGuard>
          </Match>
        </Switch>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = FeedPage

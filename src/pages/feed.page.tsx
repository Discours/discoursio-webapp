import { createEffect, on, onCleanup } from 'solid-js'

import { Feed } from '../components/Views/Feed'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'
import { LoadShoutsOptions } from '../graphql/schema/core.gen'
import { useRouter } from '../stores/router'
import { loadMyFeed, loadShouts, resetSortedArticles } from '../stores/zine/articles'

const handleFeedLoadShouts = (options: LoadShoutsOptions) => {
  return loadShouts({
    ...options,
    filters: {
      featured: false,
      ...options.filters,
    },
  })
}

const handleMyFeedLoadShouts = (options: LoadShoutsOptions) => {
  return loadMyFeed(options)
}

export const FeedPage = () => {
  const { t } = useLocalize()
  const { page } = useRouter()
  createEffect(on(page, (_) => resetSortedArticles(), { defer: true }))
  onCleanup(() => resetSortedArticles())

  return (
    <PageLayout title={t('Feed')}>
      <ReactionsProvider>
        <Feed loadShouts={page().route === 'feedMy' ? handleMyFeedLoadShouts : handleFeedLoadShouts} />
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = FeedPage

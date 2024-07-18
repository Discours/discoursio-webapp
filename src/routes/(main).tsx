import { type RouteDefinition, type RouteSectionProps, createAsync } from '@solidjs/router'
import { createEffect } from 'solid-js'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { useFeed } from '~/context/feed'
import { useTopics } from '~/context/topics'
import { loadShouts, loadTopics } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { HomeView, HomeViewProps } from '../components/Views/Home'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'

export const SHOUTS_PER_PAGE = 20

const featuredLoader = (offset?: number) => {
  const SHOUTS_PER_PAGE = 20
  return loadShouts({
    filters: { featured: true },
    limit: SHOUTS_PER_PAGE,
    offset
  })
}

const fetchAllTopics = async () => {
  const allTopicsLoader = loadTopics()
  return await allTopicsLoader()
}

const fetchHomeTopData = async () => {
  const topCommentedLoader = loadShouts({
    filters: { featured: true },
    order_by: 'comments_stat',
    limit: 10
  })

  const daysago = Date.now() - 30 * 24 * 60 * 60 * 1000
  const after = Math.floor(daysago / 1000)
  const options: LoadShoutsOptions = {
    filters: {
      featured: true,
      after
    },
    order_by: 'likes_stat',
    limit: 10
  }
  const topMonthLoader = loadShouts({ ...options })

  const topRatedLoader = loadShouts({
    filters: { featured: true },
    order_by: 'likes_stat',
    limit: 10
  })
  const topRatedShouts = await topRatedLoader()
  const topMonthShouts = await topMonthLoader()
  const topCommentedShouts = await topCommentedLoader()
  return { topCommentedShouts, topMonthShouts, topRatedShouts } as Partial<HomeViewProps>
}

export const route = {
  load: async () => {
    const limit = 20
    const featuredLoader = loadShouts({
      filters: { featured: true },
      limit
    })
    return {
      ...(await fetchHomeTopData()),
      featuredShouts: await featuredLoader(),
      topics: await fetchAllTopics()
    }
  }
} satisfies RouteDefinition

export default function HomePage(props: RouteSectionProps<HomeViewProps>) {
  const { t } = useLocalize()
  const {
    setFeaturedFeed,
    featuredFeed,
    topMonthFeed,
    topViewedFeed,
    topCommentedFeed,
    topFeed: topRatedFeed
  } = useFeed()

  // preload all topics
  const { addTopics, sortedTopics } = useTopics()
  createEffect(() => {
    !sortedTopics() && props.data.topics && addTopics(props.data.topics)
  })

  // load more faetured shouts
  const loadMoreFeatured = async (offset?: number) => {
    const shoutsLoader = featuredLoader(offset)
    const loaded = await shoutsLoader()
    loaded && setFeaturedFeed((prev: Shout[]) => [...prev, ...loaded])
    return loaded as LoadMoreItems
  }

  // preload featured shouts
  const shouts = createAsync(async () => {
    if (props.data.featuredShouts) {
      setFeaturedFeed(props.data.featuredShouts)
      console.debug('[routes.main] featured feed preloaded')
      return props.data.featuredShouts
    }
    return await loadMoreFeatured()
  })

  const SHOUTS_PER_PAGE = 20

  return (
    <PageLayout withPadding={true} title={t('Discours')} key="home">
      <LoadMoreWrapper loadFunction={loadMoreFeatured} pageSize={SHOUTS_PER_PAGE} hidden={!featuredFeed()}>
        <HomeView
          featuredShouts={featuredFeed() || (shouts() as Shout[])}
          topMonthShouts={topMonthFeed() as Shout[]}
          topViewedShouts={topViewedFeed() as Shout[]}
          topRatedShouts={topRatedFeed() as Shout[]}
          topCommentedShouts={topCommentedFeed() as Shout[]}
        />
      </LoadMoreWrapper>
    </PageLayout>
  )
}

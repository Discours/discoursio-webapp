import { type RouteDefinition, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Show, createEffect } from 'solid-js'
import { LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { useFeed } from '~/context/feed'
import { useTopics } from '~/context/topics'
import { loadShouts, loadTopics } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { byStat } from '~/lib/sort'
import { SortFunction } from '~/types/common'
import { HomeView, HomeViewProps } from '../components/Views/Home'
import { Loading } from '../components/_shared/Loading'
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
  return {
    topRatedShouts: await topRatedLoader(),
    topMonthShouts: await topMonthLoader(),
    topCommentedShouts: await topCommentedLoader()
  } as Partial<HomeViewProps>
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
  const { addTopics } = useTopics()
  const { t } = useLocalize()
  const {
    setFeaturedFeed,
    featuredFeed,
    topMonthFeed,
    topViewedFeed,
    topCommentedFeed,
    topFeed: topRatedFeed
  } = useFeed()

  const data = createAsync(async (prev?: HomeViewProps) => {
    const topics = props.data?.topics || (await fetchAllTopics())
    const offset = prev?.featuredShouts?.length || 0
    const featuredShoutsLoader = featuredLoader(offset)
    const loaded = await featuredShoutsLoader()
    const featuredShouts = [
      ...(prev?.featuredShouts || []),
      ...(loaded || props.data?.featuredShouts || [])
    ]
    const sortFn = byStat('viewed')
    const topViewedShouts = featuredShouts.sort(sortFn as SortFunction<Shout>)
    return {
      ...prev,
      ...props.data,
      topViewedShouts,
      featuredShouts,
      topics
    }
  })

  createEffect(() => {
    if (data()?.topics) {
      console.debug('[routes.main] topics update')
      addTopics(data()?.topics || [])
    }
  })

  const loadMoreFeatured = async (offset?: number) => {
    const shoutsLoader = featuredLoader(offset)
    const loaded = await shoutsLoader()
    loaded && setFeaturedFeed((prev: Shout[]) => [...prev, ...loaded])
  }
  const SHOUTS_PER_PAGE = 20
  return (
    <PageLayout withPadding={true} title={t('Discours')} key="home">
      <Show when={(featuredFeed() || []).length > 0} fallback={<Loading />}>
        <LoadMoreWrapper loadFunction={loadMoreFeatured} pageSize={SHOUTS_PER_PAGE}>
          <HomeView
            featuredShouts={featuredFeed() as Shout[]}
            topMonthShouts={topMonthFeed() as Shout[]}
            topViewedShouts={topViewedFeed() as Shout[]}
            topRatedShouts={topRatedFeed() as Shout[]}
            topCommentedShouts={topCommentedFeed() as Shout[]}
          />
        </LoadMoreWrapper>
      </Show>
    </PageLayout>
  )
}

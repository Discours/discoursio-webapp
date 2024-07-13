import { type RouteDefinition, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Show, Suspense, createEffect, createSignal, onMount } from 'solid-js'
import { useTopics } from '~/context/topics'
import { loadShouts, loadTopics } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { byStat } from '~/lib/sort'
import { SortFunction } from '~/types/common'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'
import { HomeView, HomeViewProps } from '../components/Views/Home'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'

export const SHOUTS_PER_PAGE = 20

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
  const limit = 20
  const { addTopics } = useTopics()
  const { t } = useLocalize()
  const [featuredOffset, setFeaturedOffset] = createSignal<number>(0)

  const featuredLoader = (offset?: number) => {
    const result = loadShouts({
      filters: { featured: true },
      limit,
      offset
    })
    return result
  }

  // async ssr-friendly router-level cached data source
  const data = createAsync(async (prev?: HomeViewProps) => {
    const topics = props.data?.topics || (await fetchAllTopics())
    const featuredShoutsLoader = featuredLoader(featuredOffset())
    const featuredShouts = [
      ...(prev?.featuredShouts || []),
      ...((await featuredShoutsLoader()) || props.data?.featuredShouts || [])
    ]
    const sortFn = byStat('viewed')
    const topViewedShouts = featuredShouts?.sort(sortFn as SortFunction<Shout>) || []
    const result = {
      ...prev,
      ...props.data,
      topViewedShouts,
      featuredShouts,
      topics
    }
    return result
  })
  createEffect(() => data()?.topics && addTopics(data()?.topics || []))

  const [canLoadMoreFeatured, setCanLoadMoreFeatured] = createSignal(true)
  const loadMoreFeatured = async () => {
    saveScrollPosition()
    const before = data()?.featuredShouts.length || 0
    featuredLoader(featuredOffset())
    setFeaturedOffset((o: number) => o + limit)
    const after = data()?.featuredShouts.length || 0
    setTimeout(() => setCanLoadMoreFeatured((_) => before !== after), 1)
    restoreScrollPosition()
  }

  onMount(async () => await loadMoreFeatured())

  return (
    <PageLayout withPadding={true} title={t('Discours')} key={'home'}>
      <Suspense fallback={<Loading />}>
        <HomeView {...(data() as HomeViewProps)} />
        <Show when={canLoadMoreFeatured()}>
          <p class="load-more-container">
            <button class="button" onClick={loadMoreFeatured}>
              {t('Load more')}
            </button>
          </p>
        </Show>
      </Suspense>
    </PageLayout>
  )
}

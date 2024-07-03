import { type RouteDefinition, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Show, Suspense, createSignal, onMount } from 'solid-js'
import { LoadShoutsOptions } from '~/graphql/schema/core.gen'
import { loadShouts } from '~/lib/api/public'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'
import { byStat } from '~/utils/sortby'
import { HomeView, HomeViewProps } from '../components/Views/Home'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'

export const SHOUTS_PER_PAGE = 20

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
    return { ...(await fetchHomeTopData()), featuredShouts: await featuredLoader() }
  }
} satisfies RouteDefinition

export default function HomePage(props: RouteSectionProps<HomeViewProps>) {
  const limit = 20

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
    const featuredShoutsLoader = featuredLoader(featuredOffset())
    const featuredShouts = [
      ...(prev?.featuredShouts || []),
      ...((await featuredShoutsLoader()) || props.data?.featuredShouts || [])
    ]
    const sortFn = byStat('viewed')
    const topViewedShouts = featuredShouts?.sort(sortFn) || []
    const result = {
      ...prev,
      ...props.data,
      topViewedShouts,
      featuredShouts
    }
    return result
  })

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
    <PageLayout withPadding={true} title={t('Discours')}>
      <ReactionsProvider>
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
      </ReactionsProvider>
    </PageLayout>
  )
}

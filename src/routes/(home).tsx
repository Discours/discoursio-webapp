import { type RouteDefinition, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Show, Suspense, createEffect, createSignal, on, onMount } from 'solid-js'
import { loadShouts } from '~/lib/api'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'
import { HomeView, HomeViewProps } from '../components/Views/Home'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'

export const SHOUTS_PER_PAGE = 20

const fetchHomeTopData = async () => {
  const limit = 20

  const topCommentedLoader = loadShouts({
    filters: { featured: true },
    limit,
  })

  const topMonthLoader = loadShouts({
    filters: { featured: true },
    limit,
  })

  const topViewedLoader = loadShouts({
    filters: { featured: true },
    limit,
  })

  const topRatedLoader = loadShouts({
    filters: { featured: true },
    limit,
  })
  return {
    topCommentedShouts: await topCommentedLoader(),
    topMonthShouts: await topMonthLoader(),
    topRatedShouts: await topRatedLoader(),
    topViewedShouts: await topViewedLoader(),
  } as Partial<HomeViewProps>
}

export const route = {
  load: async () => {
    const limit = 20
    const featuredLoader = loadShouts({
      filters: { featured: true },
      limit,
    })
    return { ...(await fetchHomeTopData()), featuredShouts: await featuredLoader() }
  },
} satisfies RouteDefinition

export default function HomePage(props: RouteSectionProps<HomeViewProps>) {
  const limit = 20

  const { t } = useLocalize()
  const [featuredOffset, setFeaturedOffset] = createSignal<number>(0)

  const featuredLoader = (offset?: number) => {
    const result = loadShouts({
      filters: { featured: true },
      limit,
      offset,
    })
    return result
  }

  // async ssr-friendly router-level cached data source
  const data = createAsync(async (prev?: HomeViewProps) => {
    const featuredShoutsLoader = featuredLoader(featuredOffset())
    const featuredShouts = await featuredShoutsLoader()
    return {
      ...prev,
      ...props.data,
      featuredShouts: featuredShouts || prev?.featuredShouts || props.data?.featuredShouts,
    }
  })

  const [canLoadMoreFeatured, setCanLoadMoreFeatured] = createSignal(false)
  const loadMoreFeatured = async () => {
    saveScrollPosition()
    const before = data()?.featuredShouts.length || 0
    featuredLoader(featuredOffset())
    const after = data()?.featuredShouts.length || 0
    setCanLoadMoreFeatured((_) => before !== after)
    setFeaturedOffset((o: number) => o + limit)
    restoreScrollPosition()
  }

  onMount(loadMoreFeatured)

  // Re-run the loader whenever the featured offset changes
  createEffect(
    on(
      featuredOffset,
      (o: number) => {
        featuredLoader(o) // using fresh offset by itself
      },
      { defer: true },
    ),
  )
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

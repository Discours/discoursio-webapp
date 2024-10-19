import { Params, RouteSectionProps, createAsync } from '@solidjs/router'
import { Show, createEffect, createMemo, createSignal, on } from 'solid-js'
import { isServer } from 'solid-js/web'
import { TopicsNav } from '~/components/HeaderNav/TopicsNav'
import { Expo, ExpoNav } from '~/components/Views/ExpoView'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { EXPO_LAYOUTS, EXPO_TITLES, SHOUTS_PER_PAGE, useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { loadShouts } from '~/graphql/api/public'
import { LoadShoutsFilters, LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { ExpoLayoutType } from '~/types/common'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'
import { byCreated } from '~/utils/sort'

const fetchExpoShouts = async (layouts: string[]) => {
  const result = await loadShouts({
    filters: { layouts },
    limit: SHOUTS_PER_PAGE,
    offset: 0
  } as LoadShoutsOptions)
  return result
}

export const route = {
  load: async ({ params }: { params: Params }) => {
    const layouts = params.layout ? [params.layout] : EXPO_LAYOUTS
    const shoutsLoader = await fetchExpoShouts(layouts)
    return (await shoutsLoader()) as Shout[]
  }
}

export default (props: RouteSectionProps<Shout[]>) => {
  const { t } = useLocalize()
  const { expoFeed, setExpoFeed, feedByLayout } = useFeed()
  const [loadMoreVisible, setLoadMoreVisible] = createSignal(false)
  const getTitle = createMemo(() => (l?: string) => EXPO_TITLES[(l as ExpoLayoutType) || ''])

  const shouts = createAsync(async () =>
    isServer
      ? props.data
      : await fetchExpoShouts(props.params.layout ? [props.params.layout] : EXPO_LAYOUTS)
  )

  const loadMore = async () => {
    saveScrollPosition()
    const limit = SHOUTS_PER_PAGE
    const layouts = props.params.layout ? [props.params.layout] : EXPO_LAYOUTS
    const offset = expoFeed()?.length || 0
    const filters: LoadShoutsFilters = { layouts, featured: true }
    const options: LoadShoutsOptions = { filters, limit, offset }
    const fetcher = await loadShouts(options)
    const result = (await fetcher()) || []
    setLoadMoreVisible(Boolean(result?.length))
    if (result && Array.isArray(result)) {
      setExpoFeed((prev) => Array.from(new Set([...(prev || []), ...result])).sort(byCreated))
    }
    restoreScrollPosition()
    return result as LoadMoreItems
  }

  createEffect(
    on(
      () => props.params.layout,
      async (currentLayout) => {
        const layouts = currentLayout ? [currentLayout] : EXPO_LAYOUTS
        const offset = (currentLayout ? feedByLayout()[currentLayout]?.length : expoFeed()?.length) || 0
        const options: LoadShoutsOptions = {
          filters: { layouts, featured: true },
          limit: SHOUTS_PER_PAGE,
          offset
        }
        const result = await loadShouts(options)
        if (result && Array.isArray(result)) {
          setExpoFeed(result)
        } else {
          setExpoFeed([])
        }
      }
    )
  )

  return (
    <PageLayout
      withPadding={true}
      zeroBottomPadding={true}
      title={`${t('Discours')} :: ${getTitle()((props.params.layout as ExpoLayoutType) || '')}`}
    >
      <TopicsNav />
      <ExpoNav layout={(props.params.layout as ExpoLayoutType) || ''} />
      <Show when={shouts()} fallback={<Loading />} keyed>
        {(sss) => (
          <LoadMoreWrapper loadFunction={loadMore} pageSize={SHOUTS_PER_PAGE} hidden={!loadMoreVisible()}>
            <Expo shouts={sss as Shout[]} layout={(props.params.layout as ExpoLayoutType) || ''} />
          </LoadMoreWrapper>
        )}
      </Show>
    </PageLayout>
  )
}

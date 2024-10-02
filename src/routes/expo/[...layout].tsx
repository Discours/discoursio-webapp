import { Params, RouteSectionProps, createAsync } from '@solidjs/router'
import { Show, createEffect, createSignal, on } from 'solid-js'
import { TopicsNav } from '~/components/HeaderNav/TopicsNav'
import { Expo } from '~/components/Views/Expo'
import ExpoNav from '~/components/Views/Expo/ExpoNav'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
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
  return result || []
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
  const getTitle = (l?: string) => EXPO_TITLES[(l as ExpoLayoutType) || '']

  const shouts = createAsync(
    async () =>
      props.data || (await fetchExpoShouts(props.params.layout ? [props.params.layout] : EXPO_LAYOUTS))
  )

  // Функция для загрузки дополнительных шотов
  const loadMore = async () => {
    saveScrollPosition()
    const limit = SHOUTS_PER_PAGE
    const layouts = props.params.layout ? [props.params.layout] : EXPO_LAYOUTS
    const offset = expoFeed()?.length || 0
    const filters: LoadShoutsFilters = { layouts, featured: true }
    const options: LoadShoutsOptions = { filters, limit, offset }
    const shoutsFetcher = loadShouts(options)
    const result = await shoutsFetcher()
    setLoadMoreVisible(Boolean(result?.length))
    if (result) {
      setExpoFeed((prev) => Array.from(new Set([...(prev || []), ...result])).sort(byCreated))
    }
    restoreScrollPosition()
    return result as LoadMoreItems
  }
  // Эффект для загрузки данных при изменении layout
  createEffect(
    on(
      () => props.params.layout as ExpoLayoutType,
      async (layout?: ExpoLayoutType) => {
        const layouts = layout ? [layout] : EXPO_LAYOUTS
        const offset = (layout ? feedByLayout()[layout]?.length : expoFeed()?.length) || 0
        const options: LoadShoutsOptions = {
          filters: { layouts, featured: true },
          limit: SHOUTS_PER_PAGE,
          offset
        }
        const shoutsFetcher = loadShouts(options)
        const result = await shoutsFetcher()
        setExpoFeed(result || [])
      }
    )
  )
  return (
    <PageLayout
      withPadding={true}
      zeroBottomPadding={true}
      title={`${t('Discours')} :: ${getTitle(props.params.layout || '')}`}
    >
      <TopicsNav />
      <ExpoNav layout={(props.params.layout || '') as ExpoLayoutType | ''} />
      <LoadMoreWrapper loadFunction={loadMore} pageSize={SHOUTS_PER_PAGE} hidden={!loadMoreVisible()}>
        <Show when={shouts()} keyed>
          {(sss: Shout[]) => <Expo shouts={sss} layout={props.params.layout as ExpoLayoutType} />}
        </Show>
      </LoadMoreWrapper>
    </PageLayout>
  )
}

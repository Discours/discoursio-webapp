import { RouteSectionProps, createAsync, useSearchParams } from '@solidjs/router'
import { Client } from '@urql/core'
import { createEffect, createMemo } from 'solid-js'
import { FeedView } from '~/components/Views/FeedView'
import { FeedProps } from '~/components/Views/FeedView'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { PageLayout } from '~/components/_shared/PageLayout'
import { SHOUTS_PER_PAGE, useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { useTopics } from '~/context/topics'
import { loadShouts } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout, Topic } from '~/graphql/schema/core.gen'
import { FromPeriod, getFromDate } from '~/lib/fromPeriod'

export type PeriodItem = {
  value: FromPeriod
  title: string
}

export type FeedSearchParams = {
  period: FromPeriod
}

const feedLoader = async (options: Partial<LoadShoutsOptions>, _client?: Client) => {
  const shoutsLoader = loadShouts({ ...options, limit: SHOUTS_PER_PAGE } as LoadShoutsOptions)
  return await shoutsLoader()
}

export const route = {
  load: async ({ location: { query } }: RouteSectionProps<{ articles: Shout[] }>) => {
    const offset: number = Number.parseInt(query.offset as string, 10)
    const result = await feedLoader({ offset })
    return result
  }
}

const paramPattern = /^(hot|likes)$/

export default (props: RouteSectionProps<{ shouts: Shout[]; topics: Topic[] }>) => {
  const [searchParams] = useSearchParams<FeedSearchParams>() // ?period=month
  const { t } = useLocalize()
  const { feed, setFeed } = useFeed()

  // preload all topics
  const { addTopics, sortedTopics } = useTopics()
  createEffect(() => {
    !sortedTopics() && props.data.topics && addTopics(props.data.topics)
  })

  // load more feed
  const loadMoreFeed = async (offset?: number) => {
    // /feed/:order: - select order setting
    const order =
      (props.params.order && paramPattern.test(props.params.order)
        ? props.params.order === 'hot'
          ? 'last_comment'
          : props.params.order
        : 'created_at') || 'created_at'

    const options: LoadShoutsOptions = {
      limit: SHOUTS_PER_PAGE,
      offset,
      order_by: order
    }

    // ?period=month - time period filter
    if (searchParams?.period) {
      const period = searchParams?.period || 'month'
      options.filters = { after: getFromDate(period as FromPeriod) }
    }

    const loaded = await feedLoader(options)
    loaded && setFeed((prev: Shout[]) => [...prev, ...loaded])
    return loaded as LoadMoreItems
  }

  // preload shouts
  const shouts = createAsync(async () => {
    if (props.data.shouts) {
      setFeed(props.data.shouts)
      console.debug('[routes.main] feed preloaded')
      return props.data.shouts
    }
    return (await loadMoreFeed()) as Shout[]
  })

  const order = createMemo(() => {
    return (
      (paramPattern.test(props.params.order)
        ? props.params.order === 'hot'
          ? 'last_comment'
          : props.params.order
        : 'created_at') || 'created_at'
    )
  })

  return (
    <PageLayout
      withPadding={true}
      title={`${t('Discours')} :: ${t('Feed')}`}
      key="feed"
      desc="Independent media project about culture, science, art and society with horizontal editing"
    >
      <LoadMoreWrapper loadFunction={loadMoreFeed} pageSize={SHOUTS_PER_PAGE}>
        <ReactionsProvider>
          <FeedView shouts={feed() || (shouts() as Shout[])} order={order() as FeedProps['order']} />
        </ReactionsProvider>
      </LoadMoreWrapper>
    </PageLayout>
  )
}

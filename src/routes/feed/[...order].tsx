import { RouteSectionProps, createAsync, useSearchParams } from '@solidjs/router'
import { Client } from '@urql/core'
import { createEffect, createMemo } from 'solid-js'
import { AUTHORS_PER_PAGE } from '~/components/Views/AllAuthors/AllAuthors'
import { Feed } from '~/components/Views/Feed'
import { FeedProps } from '~/components/Views/Feed/Feed'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { useTopics } from '~/context/topics'
import { loadShouts } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout, Topic } from '~/graphql/schema/core.gen'
import { SHOUTS_PER_PAGE } from '../(main)'

export type FeedPeriod = 'week' | 'month' | 'year'

export type PeriodItem = {
  value: FeedPeriod
  title: string
}

export type FeedSearchParams = {
  period: FeedPeriod
}

const getFromDate = (period: FeedPeriod): number => {
  const now = new Date()
  let d: Date = now
  switch (period) {
    case 'week': {
      d = new Date(now.setDate(now.getDate() - 7))
      break
    }
    case 'month': {
      d = new Date(now.setMonth(now.getMonth() - 1))
      break
    }
    case 'year': {
      d = new Date(now.setFullYear(now.getFullYear() - 1))
      break
    }
  }
  return Math.floor(d.getTime() / 1000)
}

const feedLoader = async (options: Partial<LoadShoutsOptions>, _client?: Client) => {
  const shoutsLoader = loadShouts({ ...options, limit: SHOUTS_PER_PAGE } as LoadShoutsOptions)
  return await shoutsLoader()
}

export const route = {
  load: async ({ location: { query } }: RouteSectionProps<{ articles: Shout[] }>) => {
    const offset: number = Number.parseInt(query.offset, 10)
    const result = await feedLoader({ offset })
    return result
  }
}

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
    const paramPattern = /^(hot|likes)$/
    const order =
      (props.params.order && paramPattern.test(props.params.order)
        ? props.params.order === 'hot'
          ? 'last_reacted_at'
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
      options.filters = { after: getFromDate(period as FeedPeriod) }
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
    const paramOrderPattern = /^(hot|likes)$/
    return (
      (paramOrderPattern.test(props.params.order)
        ? props.params.order === 'hot'
          ? 'last_reacted_at'
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
      <LoadMoreWrapper loadFunction={loadMoreFeed} pageSize={AUTHORS_PER_PAGE}>
        <ReactionsProvider>
          <Feed shouts={feed() || (shouts() as Shout[])} order={order() as FeedProps['order']} />
        </ReactionsProvider>
      </LoadMoreWrapper>
    </PageLayout>
  )
}

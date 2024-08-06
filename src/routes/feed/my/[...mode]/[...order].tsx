import { RouteSectionProps, useSearchParams } from '@solidjs/router'
import { createEffect, createMemo } from 'solid-js'
import { AUTHORS_PER_PAGE } from '~/components/Views/AllAuthors/AllAuthors'
import { Feed } from '~/components/Views/Feed'
import { FeedProps } from '~/components/Views/Feed/Feed'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { PageLayout } from '~/components/_shared/PageLayout'
import { coreApiUrl } from '~/config'
import { useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { useSession } from '~/context/session'
import { useTopics } from '~/context/topics'
import {
  loadCoauthoredShouts,
  loadDiscussedShouts,
  loadFollowedShouts,
  loadUnratedShouts
} from '~/graphql/api/private'
import { graphqlClientCreate } from '~/graphql/client'
import { LoadShoutsOptions, Shout, Topic } from '~/graphql/schema/core.gen'

const feeds = {
  followed: loadFollowedShouts,
  discussed: loadDiscussedShouts,
  coauthored: loadCoauthoredShouts,
  unrated: loadUnratedShouts
}

export type FeedPeriod = 'week' | 'month' | 'year'
export type FeedSearchParams = { period?: FeedPeriod }

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

// /feed/my/followed/hot

export default (props: RouteSectionProps<{ shouts: Shout[]; topics: Topic[] }>) => {
  const [searchParams] = useSearchParams<FeedSearchParams>() // ?period=month
  const { t } = useLocalize()
  const { setFeed, feed } = useFeed()
  const { session } = useSession()
  const client = createMemo(() => graphqlClientCreate(coreApiUrl, session()?.access_token))

  // preload all topics
  const { addTopics, sortedTopics } = useTopics()
  createEffect(() => {
    !sortedTopics() && props.data.topics && addTopics(props.data.topics)
  })

  // /feed/my/:mode:
  const mode = createMemo(() => {
    const paramModePattern = /^(followed|discussed|liked|coauthored|unrated)$/
    return props.params.mode && paramModePattern.test(props.params.mode) ? props.params.mode : 'followed'
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

  // load more my feed
  const loadMoreMyFeed = async (offset?: number) => {
    const gqlHandler = feeds[mode() as keyof typeof feeds]

    // /feed/my/:mode:/:order: - select order setting
    const options: LoadShoutsOptions = {
      limit: 20,
      offset,
      order_by: order()
    }

    // ?period=month - time period filter
    if (searchParams?.period) {
      const period = searchParams?.period || 'month'
      options.filters = { after: getFromDate(period as FeedPeriod) }
    }

    const shoutsLoader = gqlHandler(client(), options)
    const loaded = await shoutsLoader()
    loaded && setFeed((prev: Shout[]) => [...prev, ...loaded])
    return loaded as LoadMoreItems
  }

  return (
    <PageLayout
      withPadding={true}
      title={`${t('Discours')} :: ${t('Feed')}`}
      key="feed"
      desc="Independent media project about culture, science, art and society with horizontal editing"
    >
      <LoadMoreWrapper loadFunction={loadMoreMyFeed} pageSize={AUTHORS_PER_PAGE}>
        <ReactionsProvider>
          <Feed
            shouts={feed() || []}
            mode={(mode() || 'all') as FeedProps['mode']}
            order={order() as FeedProps['order']}
          />
        </ReactionsProvider>
      </LoadMoreWrapper>
    </PageLayout>
  )
}

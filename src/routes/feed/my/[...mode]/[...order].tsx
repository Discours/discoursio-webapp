import { RouteSectionProps, useSearchParams } from '@solidjs/router'
import { createEffect } from 'solid-js'
import { AUTHORS_PER_PAGE } from '~/components/Views/AllAuthors/AllAuthors'
import { Feed } from '~/components/Views/Feed'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useFeed } from '~/context/feed'
import { useGraphQL } from '~/context/graphql'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { useTopics } from '~/context/topics'
import {
  loadCoauthoredShouts,
  loadDiscussedShouts,
  loadFollowedShouts,
  loadUnratedShouts
} from '~/graphql/api/private'
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
  const { setFeed } = useFeed()
  // TODO: use const { requireAuthentication } = useSession()
  const client = useGraphQL()

  // preload all topics
  const { addTopics, sortedTopics } = useTopics()
  createEffect(() => {
    !sortedTopics() && props.data.topics && addTopics(props.data.topics)
  })

  // load more my feed
  const loadMoreMyFeed = async (offset?: number) => {
    // /feed/my/:mode:
    const paramModePattern = /^(followed|discussed|liked|coauthored|unrated)$/
    const mode =
      props.params.mode && paramModePattern.test(props.params.mode) ? props.params.mode : 'followed'
    const gqlHandler = feeds[mode as keyof typeof feeds]

    // /feed/my/:mode:/:order: - select order setting
    const paramOrderPattern = /^(hot|likes)$/
    const order =
      (paramOrderPattern.test(props.params.order)
        ? props.params.order === 'hot'
          ? 'last_comment'
          : props.params.order
        : 'created_at') || 'created_at'

    const options: LoadShoutsOptions = {
      limit: 20,
      offset,
      order_by: order
    }

    // ?period=month - time period filter
    if (searchParams?.period) {
      const period = searchParams?.period || 'month'
      options.filters = { after: getFromDate(period as FeedPeriod) }
    }

    const shoutsLoader = gqlHandler(client, options)
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
          <Feed />
        </ReactionsProvider>
      </LoadMoreWrapper>
    </PageLayout>
  )
}

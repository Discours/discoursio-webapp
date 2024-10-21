import { RouteSectionProps, useSearchParams } from '@solidjs/router'
import { createEffect, createMemo } from 'solid-js'

import { Client } from '@urql/core'
import { AUTHORS_PER_PAGE } from '~/components/Views/AllAuthorsView'
import { FeedProps, FeedView } from '~/components/Views/FeedView'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { PageLayout } from '~/components/_shared/PageLayout'
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
import { LoadShoutsOptions, Shout, Topic } from '~/graphql/schema/core.gen'
import { FromPeriod, getFromDate } from '~/lib/fromPeriod'

const feeds = {
  followed: loadFollowedShouts,
  discussed: loadDiscussedShouts,
  coauthored: loadCoauthoredShouts,
  unrated: loadUnratedShouts
}

export type FeedSearchParams = { period?: FromPeriod }

export default (props: RouteSectionProps<{ shouts: Shout[]; topics: Topic[] }>) => {
  const [searchParams] = useSearchParams<FeedSearchParams>() // ?period=month
  const { t } = useLocalize()
  const { setFeed, feed } = useFeed()
  const { client } = useSession()

  // preload all topics
  const { addTopics, sortedTopics } = useTopics()
  createEffect(() => {
    !sortedTopics() && props.data.topics && addTopics(props.data.topics)
  })

  // /feed/:mode:
  const mode = createMemo(() => props.params.mode || 'recent')

  // /feed/:mode/:order
  const order = createMemo(() => {
    return (
      (['recent', 'hot', 'likes'].includes(props.params.order)
        ? props.params.order === 'hot'
          ? 'last_comment'
          : props.params.order
        : 'created_at') || 'created_at'
    )
  })

  // load more my feed
  const loadMoreMyFeed = async (offset?: number) => {
    const gqlHandler = feeds[mode() as keyof typeof feeds]

    // /feed/:mode:/:order: - select order setting
    const options: LoadShoutsOptions = {
      limit: 20,
      offset,
      order_by: order()
    }

    // ?period=month - time period filter
    if (searchParams?.period) {
      const period = searchParams?.period || 'month'
      options.filters = { after: getFromDate(period as FromPeriod) }
    }
    if (!client()) {
      throw new Error('API client not connected')
    }
    const shoutsLoader = gqlHandler(client() as Client, options)
    const loaded = await shoutsLoader()
    loaded && setFeed((prev: Shout[]) => [...prev, ...loaded] as Shout[])
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
          <FeedView
            shouts={feed() || []}
            mode={(mode() || 'all') as FeedProps['mode']}
            order={order() as FeedProps['order']}
          />
        </ReactionsProvider>
      </LoadMoreWrapper>
    </PageLayout>
  )
}

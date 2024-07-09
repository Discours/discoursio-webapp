import { RouteSectionProps, createAsync, useParams, useSearchParams } from '@solidjs/router'
import { Client } from '@urql/core'
import { Show, createEffect, createSignal } from 'solid-js'
import { Feed } from '~/components/Views/Feed'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useGraphQL } from '~/context/graphql'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { useSession } from '~/context/session'
import {
  loadBookmarkedShouts,
  loadCoauthoredShouts,
  loadDiscussedShouts,
  loadFollowedShouts,
  loadUnratedShouts
} from '~/graphql/api/private'
import { loadShouts } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { SHOUTS_PER_PAGE } from '../(home)'

export type FeedPeriod = 'week' | 'month' | 'year'

export type PeriodItem = {
  value: FeedPeriod
  title: string
}

export type FeedSearchParams = {
  by: 'after' | 'likes' | 'last_comment'
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

const fetchPublishedShouts = async (offset?: number, _client?: Client) => {
  const shoutsLoader = loadShouts({ filters: { featured: undefined }, limit: SHOUTS_PER_PAGE, offset })
  return await shoutsLoader()
}

const fetchBookmarkedShouts = async (offset?: number, client?: Client) => {
  const shoutsLoader = loadBookmarkedShouts(client, { limit: SHOUTS_PER_PAGE, offset })
  return await shoutsLoader()
}

const fetchUnratedShouts = async (offset?: number, client?: Client) => {
  const shoutsLoader = loadUnratedShouts(client, { limit: SHOUTS_PER_PAGE, offset })
  return await shoutsLoader()
}

const fetchFollowedShouts = async (offset?: number, client?: Client) => {
  const shoutsLoader = loadFollowedShouts(client, { limit: SHOUTS_PER_PAGE, offset })
  return await shoutsLoader()
}

const fetchDiscussedShouts = async (offset?: number, client?: Client) => {
  const shoutsLoader = loadDiscussedShouts(client, { limit: SHOUTS_PER_PAGE, offset })
  return await shoutsLoader()
}

const fetchCoauthoredShouts = async (offset?: number, client?: Client) => {
  const shoutsLoader = loadCoauthoredShouts(client, { limit: SHOUTS_PER_PAGE, offset })
  return await shoutsLoader()
}

const fetchersByMode = {
  followed: fetchFollowedShouts,
  bookmarked: fetchBookmarkedShouts,
  discussed: fetchDiscussedShouts,
  coauthored: fetchCoauthoredShouts,
  unrated: fetchUnratedShouts
}

export const route = {
  load: async ({ location: { query } }: RouteSectionProps<{ articles: Shout[] }>) => {
    const offset: number = Number.parseInt(query.offset, 10)
    const result = await fetchPublishedShouts(offset)
    return result
  }
}

export default (props: RouteSectionProps<Shout[]>) => {
  const [searchParams] = useSearchParams<FeedSearchParams>()
  const { t } = useLocalize()
  const params = useParams()
  const client = useGraphQL()
  const { session } = useSession()
  const [offset, setOffset] = createSignal<number>(0)
  const shouts = createAsync(async () => ({ ...props.data }) || (await loadMore()))
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal<boolean>(true)
  const loadMore = async () => {
    const newOffset = offset() + SHOUTS_PER_PAGE
    setOffset(newOffset)
    const options: LoadShoutsOptions = {
      limit: SHOUTS_PER_PAGE,
      offset: newOffset,
      order_by: searchParams?.by
    }

    if (searchParams?.by === 'after') {
      const period = searchParams?.by || 'month'
      options.filters = { after: getFromDate(period as FeedPeriod) }
    }
    if (!session()) return await fetchPublishedShouts(newOffset)
    const fetcher = fetchersByMode[params.feed as keyof typeof fetchersByMode]
    if (!fetcher) return await fetchPublishedShouts(newOffset)
    return await fetcher(newOffset, client)
  }
  createEffect(() => setIsLoadMoreButtonVisible(offset() < (shouts()?.length || 0)))
  return (
    <PageLayout
      withPadding={true}
      title={`${t('Discours')} :: ${t('Feed')}`}
      key="feed"
      desc="Independent media project about culture, science, art and society with horizontal editing"
    >
      <ReactionsProvider>
        <Feed shouts={shouts() || []} />
      </ReactionsProvider>
      <Show when={isLoadMoreButtonVisible()}>
        <p class="load-more-container">
          <button class="button" onClick={loadMore}>
            {t('Load more')}
          </button>
        </p>
      </Show>
    </PageLayout>
  )
}

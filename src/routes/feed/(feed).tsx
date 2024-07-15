import { RouteSectionProps, createAsync, useSearchParams } from '@solidjs/router'
import { Client } from '@urql/core'
import { createSignal } from 'solid-js'
import { AUTHORS_PER_PAGE } from '~/components/Views/AllAuthors/AllAuthors'
import { Feed } from '~/components/Views/Feed'
import { LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { loadShouts } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { SHOUTS_PER_PAGE } from '../(main)'

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
  const {setNonFeaturedFeed} = useFeed()
  const [offset, setOffset] = createSignal<number>(0)
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
    const result = await fetchPublishedShouts(newOffset)
    result && setNonFeaturedFeed(result)
    return
  }
  const shouts = createAsync(async () => props.data || await loadMore())

  return (
    <PageLayout
      withPadding={true}
      title={`${t('Discours')} :: ${t('Feed')}`}
      key="feed"
      desc="Independent media project about culture, science, art and society with horizontal editing"
    >
      <LoadMoreWrapper loadFunction={loadMore} pageSize={AUTHORS_PER_PAGE}>
        <ReactionsProvider>
          <Feed shouts={shouts() || []} />
        </ReactionsProvider>
      </LoadMoreWrapper>
    </PageLayout>
  )
}

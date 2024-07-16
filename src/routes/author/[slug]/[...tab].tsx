import { RouteSectionProps, createAsync } from '@solidjs/router'
import { ErrorBoundary, createEffect, createMemo } from 'solid-js'
import { AuthorView } from '~/components/Views/Author'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useAuthors } from '~/context/authors'
import { useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider, useReactions } from '~/context/reactions'
import { loadAuthors, loadReactions, loadShouts, loadTopics } from '~/graphql/api/public'
import {
  Author,
  LoadShoutsOptions,
  QueryLoad_Authors_ByArgs,
  Shout,
  Topic
} from '~/graphql/schema/core.gen'
import { getImageUrl } from '~/lib/getThumbUrl'
import { SHOUTS_PER_PAGE } from '../../(main)'

const fetchAuthorShouts = async (slug: string, offset?: number) => {
  const opts: LoadShoutsOptions = { filters: { author: slug }, limit: SHOUTS_PER_PAGE, offset }
  const shoutsLoader = loadShouts(opts)
  return await shoutsLoader()
}

const fetchAllTopics = async () => {
  const topicsFetcher = loadTopics()
  return await topicsFetcher()
}

const fetchAuthor = async (slug: string) => {
  const authorFetcher = loadAuthors({ by: { slug }, limit: 1, offset: 0 } as QueryLoad_Authors_ByArgs)
  const aaa = await authorFetcher()
  return aaa?.[0]
}

export const route = {
  load: async ({ params, location: { query } }: RouteSectionProps<{ articles: Shout[] }>) => {
    const offset: number = Number.parseInt(query.offset, 10)
    return {
      author: await fetchAuthor(params.slug),
      shouts: await fetchAuthorShouts(params.slug, offset),
      topics: await fetchAllTopics()
    }
  }
}

export type AuthorPageProps = { articles?: Shout[]; author?: Author; topics?: Topic[] }

export default function AuthorPage(props: RouteSectionProps<AuthorPageProps>) {
  const { addAuthor, authorsEntities } = useAuthors()
  const articles = createAsync(
    async () => props.data.articles || (await fetchAuthorShouts(props.params.slug)) || []
  )
  const author = createAsync(async () => {
    const loadedBefore = authorsEntities()[props.params.slug]
    if (loadedBefore) return loadedBefore

    const a = props.data.author || (await fetchAuthor(props.params.slug))
    a && addAuthor(a)
    return a
  })
  const topics = createAsync(async () => props.data.topics || (await fetchAllTopics()))
  const { t } = useLocalize()
  const title = createMemo(() => `${author()?.name || ''}`)

  createEffect(() => {
    if (author()) {
      console.debug('[routes] author/[slug] author loaded fx')
      window?.gtag?.('event', 'page_view', {
        page_title: author()?.name || '',
        page_location: window?.location.href || '',
        page_path: window?.location.pathname || ''
      })
    }
  })

  const cover = createMemo(() =>
    author()?.pic
      ? getImageUrl(author()?.pic || '', { width: 1200 })
      : getImageUrl('production/image/logo_image.png')
  )

  const selectedTab = createMemo(() => (props.params.tab in ['comments', 'about'] ? props.params.tab : ''))
  const { addReactions } = useReactions()
  const loadMoreComments = async () => {
    const commentsFetcher = loadReactions({
      by: { comment: true, created_by: author()?.id }
    })
    const ccc = await commentsFetcher()
    ccc && addReactions(ccc)
    return ccc as LoadMoreItems
  }
  const { addFeed, feedByAuthor } = useFeed()
  const loadMoreAuthorShouts = async () => {
    const slug = author()?.slug
    const offset = feedByAuthor()[props.params.slug].length
    const shoutsFetcher = loadShouts({
      filters: { author: slug },
      offset,
      limit: SHOUTS_PER_PAGE
    })
    const sss = await shoutsFetcher()
    sss && addFeed(sss)
    return sss as LoadMoreItems
  }

  return (
    <ErrorBoundary fallback={(_err) => <FourOuFourView />}>
      <PageLayout
        title={`${t('Discours')} :: ${title()}`}
        headerTitle={author()?.name || ''}
        slug={author()?.slug}
        desc={author()?.about || author()?.bio || ''}
        cover={cover()}
      >
        <ReactionsProvider>
          <LoadMoreWrapper
            loadFunction={(selectedTab() === 'comments' ? loadMoreComments : loadMoreAuthorShouts)}
            pageSize={SHOUTS_PER_PAGE}
            hidden={selectedTab() !== '' || selectedTab() !== 'comments'}
          >
            <AuthorView
              author={author() as Author}
              selectedTab={selectedTab()}
              authorSlug={props.params.slug}
              shouts={feedByAuthor()[props.params.slug] || articles() as Shout[]}
              topics={topics()}
            />
          </LoadMoreWrapper>
        </ReactionsProvider>
      </PageLayout>
    </ErrorBoundary>
  )
}

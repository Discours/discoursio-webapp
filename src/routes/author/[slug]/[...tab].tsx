import { RouteSectionProps, createAsync, useParams } from '@solidjs/router'
import { ErrorBoundary, Suspense, createEffect, createMemo } from 'solid-js'
import { AuthorView } from '~/components/Views/Author'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useAuthors } from '~/context/authors'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { loadAuthors, loadShouts, loadTopics } from '~/graphql/api/public'
import {
  Author,
  LoadShoutsOptions,
  QueryLoad_Authors_ByArgs,
  Shout,
  Topic
} from '~/graphql/schema/core.gen'
import { getImageUrl } from '~/lib/getImageUrl'
import { SHOUTS_PER_PAGE } from '../../(home)'

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
    const result = await fetchAuthorShouts(params.slug, offset)
    return {
      author: await fetchAuthor(params.slug),
      shouts: result || [],
      topics: await fetchAllTopics()
    }
  }
}

export default (props: RouteSectionProps<{ articles: Shout[]; author: Author; topics: Topic[] }>) => {
  const params = useParams()
  const { addAuthor } = useAuthors()
  const articles = createAsync(
    async () => props.data.articles || (await fetchAuthorShouts(params.slug)) || []
  )
  const author = createAsync(async () => {
    const a = props.data.author || (await fetchAuthor(params.slug))
    addAuthor(a)
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

  const selectedTab = createMemo(() => params.tab in ['followers', 'shouts'] ? params.tab : 'name')
  return (
    <ErrorBoundary fallback={(_err) => <FourOuFourView />}>
      <Suspense fallback={<Loading />}>
        <PageLayout
          title={`${t('Discours')} :: ${title()}`}
          headerTitle={author()?.name || ''}
          slug={author()?.slug}
          desc={author()?.about || author()?.bio || ''}
          cover={cover()}
        >
          <ReactionsProvider>
            <AuthorView
              author={author() as Author}
              selectedTab={selectedTab()}
              authorSlug={params.slug}
              shouts={articles() as Shout[]}
              topics={topics()}
            />
          </ReactionsProvider>
        </PageLayout>
      </Suspense>
    </ErrorBoundary>
  )
}

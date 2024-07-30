import { RouteSectionProps } from '@solidjs/router'
import { ErrorBoundary, Suspense, createEffect, createMemo, createSignal, on } from 'solid-js'
import { AuthorView } from '~/components/Views/Author'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useAuthors } from '~/context/authors'
import { SHOUTS_PER_PAGE, useFeed } from '~/context/feed'
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
import { getImageUrl } from '~/lib/getThumbUrl'

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
  const [author, setAuthor] = createSignal<Author | undefined>(undefined)

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

  // author shouts
  const { addFeed, feedByAuthor } = useFeed()
  const shoutsByAuthor = createMemo(() => feedByAuthor()[props.params.slug])

  createEffect(
    on(
      [() => props.params.slug || '', author],
      async ([slug, profile]) => {
        if (!profile) {
          const loadedAuthor = authorsEntities()[slug] || (await fetchAuthor(slug))
          if (loadedAuthor) {
            addAuthor(loadedAuthor)
            setAuthor(loadedAuthor)
          }
        }
      },
      { defer: true }
    )
  )

  const loadAuthorShoutsMore = async (offset: number) => {
    const loadedShouts = await fetchAuthorShouts(props.params.slug, offset)
    loadedShouts && addFeed(loadedShouts)
    return (loadedShouts || []) as LoadMoreItems
  }

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
            <LoadMoreWrapper loadFunction={loadAuthorShoutsMore} pageSize={SHOUTS_PER_PAGE}>
              <AuthorView
                author={author() as Author}
                selectedTab={props.params.tab}
                authorSlug={props.params.slug}
                shouts={shoutsByAuthor()}
              />
            </LoadMoreWrapper>
          </ReactionsProvider>
        </PageLayout>
      </Suspense>
    </ErrorBoundary>
  )
}

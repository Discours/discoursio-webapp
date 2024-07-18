import { RouteSectionProps } from '@solidjs/router'
import { ErrorBoundary, createEffect, createMemo, createSignal, on } from 'solid-js'
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
  QueryLoad_Reactions_ByArgs,
  Reaction,
  ReactionKind,
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

const fetchAuthorComments = async (slug: string, offset?: number) => {
  const opts: QueryLoad_Reactions_ByArgs = {
    by: { comment: true, author: slug },
    limit: SHOUTS_PER_PAGE,
    offset
  }
  const shoutsLoader = loadReactions(opts)
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

  // author comments
  const { addReactions, reactionEntities } = useReactions()
  const commentsByAuthor = createMemo(() =>
    Object.values(reactionEntities).filter(
      (r: Reaction) => r.kind === ReactionKind.Comment && r.created_by.id === author()?.id
    )
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

  const loadAuthorDataMore = async (offset = 0) => {
    if (props.params.tab === 'comments') {
      const commentsOffset = commentsByAuthor().length
      const loadedComments = await fetchAuthorComments(props.params.slug, commentsOffset)
      loadedComments && addReactions(loadedComments)
      return (loadedComments || []) as LoadMoreItems
    }
    const shoutsOffset = shoutsByAuthor().length
    const loadedShouts = await fetchAuthorShouts(props.params.slug, shoutsOffset)
    loadedShouts && addFeed(loadedShouts)
    return (loadedShouts || []) as LoadMoreItems
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
            loadFunction={loadAuthorDataMore}
            pageSize={SHOUTS_PER_PAGE}
            hidden={!props.params.tab || props.params.tab !== 'comments'}
          >
            <AuthorView
              author={author() as Author}
              selectedTab={props.params.tab}
              authorSlug={props.params.slug}
              shouts={shoutsByAuthor()}
            />
          </LoadMoreWrapper>
        </ReactionsProvider>
      </PageLayout>
    </ErrorBoundary>
  )
}

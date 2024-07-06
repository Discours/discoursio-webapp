import { RouteSectionProps, createAsync, useParams } from '@solidjs/router'
import { ErrorBoundary, Suspense, createMemo, createReaction } from 'solid-js'
import { AuthorView } from '~/components/Views/Author'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useAuthors } from '~/context/authors'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { loadShouts } from '~/graphql/api/public'
import { Author, LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { SHOUTS_PER_PAGE } from '../../(home)'

const fetchAuthorShouts = async (slug: string, offset?: number) => {
  const opts: LoadShoutsOptions = { filters: { author: slug }, limit: SHOUTS_PER_PAGE, offset }
  const shoutsLoader = loadShouts(opts)
  return await shoutsLoader()
}

export const route = {
  load: async ({ params, location: { query } }: RouteSectionProps<{ articles: Shout[] }>) => {
    const offset: number = Number.parseInt(query.offset, 10)
    const result = await fetchAuthorShouts(params.slug, offset)
    return result
  }
}

export default (props: RouteSectionProps<{ articles: Shout[] }>) => {
  const params = useParams()
  const articles = createAsync(
    async () => props.data.articles || (await fetchAuthorShouts(params.slug)) || []
  )
  const { authorsEntities } = useAuthors()
  const { t } = useLocalize()
  const author = createMemo(() => authorsEntities?.()[params.slug])
  const title = createMemo(() => `${author()?.name || ''}`)

  // docs: `a side effect that is run the first time the expression
  // wrapped by the returned tracking function is notified of a change`
  createReaction(() => {
    if (author()) {
      console.debug('[routes.slug] article signal changed once')
      window?.gtag?.('event', 'page_view', {
        page_title: author()?.name || '',
        page_location: window?.location.href || '',
        page_path: window?.location.pathname || ''
      })
    }
  })
  return (
    <ErrorBoundary fallback={(_err) => <FourOuFourView />}>
      <Suspense fallback={<Loading />}>
        <PageLayout
          title={`${t('Discours')} :: ${title()}`}
          headerTitle={author()?.name || ''}
          slug={author()?.slug}
          articleBody={author()?.about || author()?.bio || ''}
          cover={author()?.pic || ''}
        >
          <ReactionsProvider>
            <AuthorView
              author={author() as Author}
              authorSlug={params.slug}
              shouts={articles() as Shout[]}
              selectedTab={params.tab || ''}
            />
          </ReactionsProvider>
        </PageLayout>
      </Suspense>
    </ErrorBoundary>
  )
}

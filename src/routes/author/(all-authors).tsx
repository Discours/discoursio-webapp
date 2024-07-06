import { RouteDefinition, RouteLoadFuncArgs, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Suspense, createReaction } from 'solid-js'
import { AllAuthors } from '~/components/Views/AllAuthors'
import { AUTHORS_PER_PAGE } from '~/components/Views/AllAuthors/AllAuthors'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useAuthors } from '~/context/authors'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { loadAuthors, loadAuthorsAll } from '~/graphql/api/public'
import { Author, AuthorsBy } from '~/graphql/schema/core.gen'

const fetchAuthorsWithStat = async (offset = 0, order?: string) => {
  const by: AuthorsBy = { order }
  const authorsFetcher = loadAuthors({ by, offset, limit: AUTHORS_PER_PAGE })
  return await authorsFetcher()
}

const fetchAllAuthors = async () => {
  const authorsAllFetcher = loadAuthorsAll()
  return await authorsAllFetcher()
}

export const route = {
  load: ({ location: { query } }: RouteLoadFuncArgs) =>
    fetchAuthorsWithStat(Number.parseInt(query.offset), query.by || 'name')
} satisfies RouteDefinition

export default function AllAuthorsPage(props: RouteSectionProps<{ authors: Author[] }>) {
  const { t } = useLocalize()
  const { authorsSorted, addAuthors } = useAuthors()
  const authors = createAsync<Author[]>(
    async () => authorsSorted?.() || props.data.authors || (await fetchAllAuthors())
  )
  createReaction(() => typeof addAuthors === 'function' && addAuthors?.(authors() || []))
  return (
    <PageLayout withPadding={true} title={`${t('Discours')} :: ${t('All authors')}`}>
      <ReactionsProvider>
        <Suspense fallback={<Loading />}>
          <AllAuthors authors={authors() || []} isLoaded={Boolean(authors())} />
        </Suspense>
      </ReactionsProvider>
    </PageLayout>
  )
}

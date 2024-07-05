import { RouteDefinition, RouteLoadFuncArgs, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Suspense } from 'solid-js'
import { AllAuthors } from '~/components/Views/AllAuthors'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { loadAuthors } from '~/graphql/api/public'
import { Author, QueryLoad_Authors_ByArgs } from '~/graphql/schema/core.gen'

const fetchData = async () => {
  const opts: QueryLoad_Authors_ByArgs = {
    by: {
      after: undefined,
      created_at: undefined,
      last_seen: undefined,
      name: undefined,
      order: undefined,
      slug: undefined,
      stat: undefined,
      topic: undefined
    }
  }
  const topicsFetcher = loadAuthors(opts)
  return await topicsFetcher()
}
const AUTHORS_PER_PAGE = 20
export const route = {
  load: (_args: RouteLoadFuncArgs) => {
    const opts: QueryLoad_Authors_ByArgs = {
      by: {
        after: undefined,
        created_at: undefined,
        last_seen: undefined,
        name: undefined,
        order: undefined,
        slug: undefined,
        stat: undefined,
        topic: undefined
      },
      limit: AUTHORS_PER_PAGE,
      offset: 0
    }
    return loadAuthors(opts)
  }
} satisfies RouteDefinition

export default function AllAuthorsPage(props: RouteSectionProps<{ authors: Author[] }>) {
  const { t } = useLocalize()
  const authors = createAsync<Author[]>(async () => props.data.authors || (await fetchData()))
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

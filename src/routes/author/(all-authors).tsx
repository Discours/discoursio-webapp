import { RouteDefinition, RouteLoadFuncArgs, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Suspense, createEffect, on } from 'solid-js'
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
  load: async ({ location: { query } }: RouteLoadFuncArgs) => {
      const by = query.by
      const isAll = !by || by === 'name'
      return {
        authors: isAll && await fetchAllAuthors(),
        topFollowedAuthors: await fetchAuthorsWithStat(10, 'followers'),
        topShoutsAuthors: await fetchAuthorsWithStat(10, 'shouts')
      } as AllAuthorsData
  }
} satisfies RouteDefinition

type AllAuthorsData = { authors: Author[], topFollowedAuthors: Author[], topShoutsAuthors: Author[] }

// addAuthors to context

export default function AllAuthorsPage(props: RouteSectionProps<AllAuthorsData>) {
  const { t } = useLocalize()
  const { addAuthors } = useAuthors()

  // async load data: from ssr or fetch
  const data = createAsync<AllAuthorsData>(async () => {
    if (props.data) return props.data
    return {
      authors: await fetchAllAuthors(),
      topFollowedAuthors: await fetchAuthorsWithStat(10, 'followers'),
      topShoutsAuthors: await fetchAuthorsWithStat(10, 'shouts')
    } as AllAuthorsData
  })

  // update context when data is loaded
  createEffect(on([data, () => addAuthors],
    ([data, aa])=> {
      if(data && aa) {
        aa(data.authors as Author[])
        aa(data.topFollowedAuthors as Author[])
        aa(data.topShoutsAuthors as Author[])
        console.debug('[routes.author] added all authors:', data.authors)
      }
    }, { defer: true}
  ))

  return (
    <PageLayout withPadding={true} title={`${t('Discours')} :: ${t('All authors')}`}>
      <ReactionsProvider>
        <Suspense fallback={<Loading />}>
          <AllAuthors
            isLoaded={Boolean(data()?.authors)}
            authors={data()?.authors || []}
            topFollowedAuthors={data()?.topFollowedAuthors}
            topWritingAuthors={data()?.topShoutsAuthors}/>
        </Suspense>
      </ReactionsProvider>
    </PageLayout>
  )
}

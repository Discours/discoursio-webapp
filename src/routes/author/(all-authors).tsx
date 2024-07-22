import { RouteDefinition, RoutePreloadFuncArgs, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Suspense, createEffect, on } from 'solid-js'
import { AllAuthors } from '~/components/Views/AllAuthors'
import { AUTHORS_PER_PAGE } from '~/components/Views/AllAuthors/AllAuthors'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useAuthors } from '~/context/authors'
import { useLocalize } from '~/context/localize'
import { loadAuthors, loadAuthorsAll } from '~/graphql/api/public'
import { Author, AuthorsBy } from '~/graphql/schema/core.gen'

// Fetch Function
const fetchAllAuthors = async () => {
  const authorsAllFetcher = loadAuthorsAll()
  return await authorsAllFetcher()
}

//Route Defenition
export const route = {
  load: async ({ location: { query } }: RoutePreloadFuncArgs) => {
    return {
      authors: await fetchAllAuthors()
    }
  }
} satisfies RouteDefinition

type AllAuthorsData = { authors: Author[] }


// addAuthors to context

export default function AllAuthorsPage(props: RouteSectionProps<AllAuthorsData>) {
  const { t } = useLocalize()
  const { addAuthors } = useAuthors()

  const data = createAsync<AllAuthorsData>(async () => {
    if (props.data) return props.data
    const authors = await fetchAllAuthors()
    return {
      authors: authors || []
    }
  })

  createEffect(
    on(
      [data, () => addAuthors],
      ([data, aa]) => {
        if (data && aa) {
          aa(data.authors as Author[])
          console.debug('[routes.author] added all authors:', data.authors)
        }
      },
      { defer: true }
    )
  )

  return (
    <PageLayout
      withPadding={true}
      title={`${t('Discours')} :: ${t('All authors')}`}
      desc="List of authors of the open editorial community"
    >
      <Suspense fallback={<Loading />}>
        <AllAuthors
          isLoaded={Boolean(data()?.authors)}
          authors={data()?.authors || []}
        />
      </Suspense>
    </PageLayout>
  )
}

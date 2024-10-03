import { RouteDefinition, RouteSectionProps, createAsync } from '@solidjs/router'
import { InboxView } from '~/components/Views/InboxView'
import { PageLayout } from '~/components/_shared/PageLayout'
import { ShowOnlyOnClient } from '~/components/_shared/ShowOnlyOnClient'
import { useAuthors } from '~/context/authors'
import { useLocalize } from '~/context/localize'
import { loadAuthorsAll } from '~/graphql/api/public'
import { Author } from '~/graphql/schema/core.gen'

export const route = {
  load: async () => {
    const authorsAllFetcher = loadAuthorsAll()
    return {
      authors: await authorsAllFetcher()
    }
  }
} satisfies RouteDefinition

export const InboxPage = (props: RouteSectionProps<{ authors: Author[] }>) => {
  const { t } = useLocalize()
  const { authorsSorted } = useAuthors()
  const authors = createAsync(async () => {
    const authorsAllFetcher = loadAuthorsAll()
    return props.data.authors || authorsSorted() || (await authorsAllFetcher())
  })

  return (
    <PageLayout hideFooter={true} title={t('Inbox')}>
      <ShowOnlyOnClient>
        <InboxView authors={authors() || []} />
      </ShowOnlyOnClient>
    </PageLayout>
  )
}

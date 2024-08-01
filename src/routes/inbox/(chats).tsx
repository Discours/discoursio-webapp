import { RouteDefinition, RouteSectionProps, createAsync } from '@solidjs/router'
import { InboxView } from '~/components/Views/Inbox/Inbox'
import { PageLayout } from '~/components/_shared/PageLayout'
import { ShowOnlyOnClient } from '~/components/_shared/ShowOnlyOnClient'
import { useLocalize } from '~/context/localize'
import { Author } from '~/graphql/schema/core.gen'
import { fetchAllAuthors } from '../author/(all-authors)'

export const route = {
  load: async () => {
    return {
      authors: await fetchAllAuthors()
    }
  }
} satisfies RouteDefinition

export const InboxPage = (props: RouteSectionProps<{ authors: Author[] }>) => {
  const { t } = useLocalize()
  const authors = createAsync(async () => props.data.authors || (await fetchAllAuthors()))

  return (
    <PageLayout hideFooter={true} title={t('Inbox')}>
      <ShowOnlyOnClient>
        <InboxView authors={authors() || []} />
      </ShowOnlyOnClient>
    </PageLayout>
  )
}

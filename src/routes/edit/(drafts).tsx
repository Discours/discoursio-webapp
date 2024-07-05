import { createAsync } from '@solidjs/router'
import { Client } from '@urql/core'
import { AuthGuard } from '~/components/AuthGuard'
import { DraftsView } from '~/components/Views/DraftsView'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useGraphQL } from '~/context/graphql'
import { useLocalize } from '~/context/localize'
import getDraftsQuery from '~/graphql/query/core/articles-load-drafts'
import { Shout } from '~/graphql/schema/core.gen'

const fetchDrafts = async (client: Client) => {
  const resp = await client?.query(getDraftsQuery, {}).toPromise()
  const result = resp?.data?.load_drafts || []
  return result as Shout[]
}

export const DraftsPage = () => {
  const { t } = useLocalize()
  const client = useGraphQL()
  const drafts = createAsync(async () => await fetchDrafts(client))

  return (
    <PageLayout title={`${t('Discours')} :: ${t('Drafts')}`}>
      <AuthGuard>
        <DraftsView drafts={drafts() || []} />
      </AuthGuard>
    </PageLayout>
  )
}

export default DraftsPage

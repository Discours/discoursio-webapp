import { createAsync } from '@solidjs/router'
import { Client } from '@urql/core'
import { AuthGuard } from '~/components/AuthGuard'
import { DraftsView } from '~/components/Views/DraftsView'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import getDraftsQuery from '~/graphql/query/core/articles-load-drafts'
import { Shout } from '~/graphql/schema/core.gen'

const fetchDrafts = async (client: Client) => {
  const resp = await client?.query(getDraftsQuery, {}).toPromise()
  const result = resp?.data?.load_drafts || []
  return result as Shout[]
}

export default () => {
  const { t } = useLocalize()
  const { client } = useSession()
  const drafts = createAsync(async () => client() && (await fetchDrafts(client() as Client)))

  return (
    <PageLayout title={`${t('Discours')} :: ${t('Drafts')}`}>
      <AuthGuard>
        <DraftsView drafts={drafts() || []} />
      </AuthGuard>
    </PageLayout>
  )
}

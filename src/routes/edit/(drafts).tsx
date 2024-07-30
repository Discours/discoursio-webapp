import { createAsync } from '@solidjs/router'
import { Client } from '@urql/core'
import { createMemo } from 'solid-js'
import { AuthGuard } from '~/components/AuthGuard'
import { DraftsView } from '~/components/Views/DraftsView'
import { PageLayout } from '~/components/_shared/PageLayout'
import { coreApiUrl } from '~/config'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { graphqlClientCreate } from '~/graphql/client'
import getDraftsQuery from '~/graphql/query/core/articles-load-drafts'
import { Shout } from '~/graphql/schema/core.gen'

const fetchDrafts = async (client: Client) => {
  const resp = await client?.query(getDraftsQuery, {}).toPromise()
  const result = resp?.data?.load_drafts || []
  return result as Shout[]
}

export default () => {
  const { t } = useLocalize()
  const { session } = useSession()
  const client = createMemo(() => graphqlClientCreate(coreApiUrl, session()?.access_token))
  const drafts = createAsync(async () => await fetchDrafts(client()))

  return (
    <PageLayout title={`${t('Discours')} :: ${t('Drafts')}`}>
      <AuthGuard>
        <DraftsView drafts={drafts() || []} />
      </AuthGuard>
    </PageLayout>
  )
}

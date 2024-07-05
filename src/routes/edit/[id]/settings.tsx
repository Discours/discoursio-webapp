import { useParams } from '@solidjs/router'
import { createEffect, createSignal, on } from 'solid-js'
import { AuthGuard } from '~/components/AuthGuard'
import EditSettingsView from '~/components/Views/EditView/EditSettingsView'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useGraphQL } from '~/context/graphql'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import getShoutDraft from '~/graphql/query/core/article-my'
import { Shout } from '~/graphql/schema/core.gen'

export default () => {
  const { t } = useLocalize()
  const params = useParams()
  const client = useGraphQL()
  const { session } = useSession()
  createEffect(on(session, (s) => s?.access_token && loadDraft(), { defer: true }))
  const [shout, setShout] = createSignal<Shout>()
  const loadDraft = async () => {
    const result = await client.query(getShoutDraft, { shout_id: params.id }).toPromise()
    if (result) {
      const { shout: loadedShout, error } = result.data.get_my_shout
      if (error) throw Error(error)
      setShout(loadedShout)
    }
  }
  return (
    <PageLayout title={`${t('Discours')} :: ${t('Publication settings')}`}>
      <AuthGuard>
        <EditSettingsView shout={shout() as Shout} />
      </AuthGuard>
    </PageLayout>
  )
}

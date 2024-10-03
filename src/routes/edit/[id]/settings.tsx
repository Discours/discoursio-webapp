import { AuthToken } from '@authorizerdev/authorizer-js'
import { RouteSectionProps } from '@solidjs/router'
import { createEffect, createSignal, on } from 'solid-js'
import { AuthGuard } from '~/components/AuthGuard'
import { EditSettingsView } from '~/components/Views/EditSettingsView'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import getShoutDraft from '~/graphql/query/core/article-my'
import { Shout } from '~/graphql/schema/core.gen'

export default (props: RouteSectionProps) => {
  const { t } = useLocalize()
  const { session, client } = useSession()
  const [shout, setShout] = createSignal<Shout>()

  createEffect(
    on(
      session,
      async (s?: AuthToken) => {
        if (!s?.access_token) return
        const shout_id = Number.parseInt(props.params.id)
        const result = await client()?.query(getShoutDraft, { shout_id }).toPromise()
        if (result) {
          const { shout: loadedShout, error } = result.data.get_my_shout
          if (error) throw new Error(error)
          setShout(loadedShout)
        }
      },
      {}
    )
  )

  return (
    <PageLayout title={`${t('Discours')} :: ${t('Publication settings')}`}>
      <AuthGuard>
        <EditSettingsView shout={shout() as Shout} />
      </AuthGuard>
    </PageLayout>
  )
}

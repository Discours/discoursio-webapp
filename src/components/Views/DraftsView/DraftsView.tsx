import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on } from 'solid-js'

import { useNavigate } from '@solidjs/router'
import { useGraphQL } from '~/context/graphql'
import getDraftsQuery from '~/graphql/query/core/articles-load-drafts'
import { useEditorContext } from '../../../context/editor'
import { useSession } from '../../../context/session'
import { Shout } from '../../../graphql/schema/core.gen'
import { Draft } from '../../Draft'
import { Loading } from '../../_shared/Loading'
import styles from './DraftsView.module.scss'

export const DraftsView = () => {
  const { session } = useSession()
  const authorized = createMemo<boolean>(() => Boolean(session()?.access_token))
  const navigate = useNavigate()
  const [drafts, setDrafts] = createSignal<Shout[]>([])
  const [loading, setLoading] = createSignal(false)
  const { query } = useGraphQL()

  createEffect(
    on(
      () => Boolean(session()?.access_token),
      async (s) => {
        if (s) {
          setLoading(true)
          const resp = await query(getDraftsQuery, {}).toPromise()
          const result = resp?.data?.get_shouts_drafts
          if (result) {
            const { error, drafts: loadedDrafts } = result
            if (error) console.warn(error)
            if (loadedDrafts) setDrafts(loadedDrafts)
          }
          setLoading(false)
        }
      },
      { defer: true },
    ),
  )

  const { publishShoutById, deleteShout } = useEditorContext()

  const handleDraftDelete = async (shout: Shout) => {
    const success = await deleteShout(shout.id)
    if (success) {
      setDrafts((ddd) => ddd.filter((d) => d.id !== shout.id))
    }
  }

  const handleDraftPublish = (shout: Shout) => {
    publishShoutById(shout.id)
    setTimeout(() => navigate('/feed'), 2000)
  }

  return (
    <div class={clsx(styles.DraftsView)}>
      <Show when={!loading() && authorized()} fallback={<Loading />}>
        <div class="wide-container">
          <div class="row">
            <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
              <For each={drafts()}>
                {(draft) => (
                  <Draft
                    class={styles.draft}
                    shout={draft}
                    onDelete={handleDraftDelete}
                    onPublish={handleDraftPublish}
                  />
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

import { openPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal, on } from 'solid-js'

import { useEditorContext } from '../../../context/editor'
import { useSession } from '../../../context/session'
import { apiClient } from '../../../graphql/client/core'
import { Shout } from '../../../graphql/schema/core.gen'
import { router } from '../../../stores/router'
import { Draft } from '../../Draft'

import { Loading } from '../../_shared/Loading'
import styles from './DraftsView.module.scss'

export const DraftsView = () => {
  const { author, loadSession } = useSession()
  const [drafts, setDrafts] = createSignal<Shout[]>([])
  const [loading, setLoading] = createSignal(false)

  createEffect(
    on(
      () => author(),
      async (a) => {
        if (a) {
          setLoading(true)
          const { shouts: loadedDrafts, error } = await apiClient.getDrafts()
          if (error) {
            console.warn(error)
            await loadSession()
          }
          setDrafts(loadedDrafts || [])
          setLoading(false)
        }
      },
      { defer: true },
    ),
  )

  const { publishShoutById, deleteShout } = useEditorContext()

  const handleDraftDelete = async (shout: Shout) => {
    const result = deleteShout(shout.id)
    if (result) {
      setDrafts((ddd) => ddd.filter((d) => d.id !== shout.id))
    }
  }

  const handleDraftPublish = (shout: Shout) => {
    const result = publishShoutById(shout.id)
    if (result) {
      openPage(router, 'feed')
    }
  }

  return (
    <div class={clsx(styles.DraftsView)}>
      <Show when={!loading() && author()?.id} fallback={<Loading />}>
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

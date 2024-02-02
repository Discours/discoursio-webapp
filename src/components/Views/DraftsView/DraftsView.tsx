import { openPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { createSignal, createEffect, For, Show } from 'solid-js'

import { useEditorContext } from '../../../context/editor'
import { useSession } from '../../../context/session'
import { apiClient } from '../../../graphql/client/core'
import { Shout } from '../../../graphql/schema/core.gen'
import { router } from '../../../stores/router'
import { Draft } from '../../Draft'

import styles from './DraftsView.module.scss'

export const DraftsView = () => {
  const { isAuthenticated, isSessionLoaded } = useSession()
  const [drafts, setDrafts] = createSignal<Shout[]>([])

  const loadDrafts = async () => {
    if (apiClient.private) {
      const loadedDrafts = await apiClient.getDrafts()
      setDrafts(loadedDrafts || [])
    }
  }

  createEffect(() => {
    if (isSessionLoaded()) loadDrafts()
  })

  const {
    actions: { publishShoutById, deleteShout },
  } = useEditorContext()

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
      <Show when={isSessionLoaded()}>
        <div class="wide-container">
          <div class="row">
            <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
              <Show when={isAuthenticated()} fallback="Давайте авторизуемся">
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
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

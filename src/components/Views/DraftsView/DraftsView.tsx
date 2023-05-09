import { clsx } from 'clsx'
import styles from './DraftsView.module.scss'
import { createSignal, For, onMount, Show } from 'solid-js'
import { Draft } from '../../Draft'
import { useSession } from '../../../context/session'
import { Shout } from '../../../graphql/types.gen'
import { apiClient } from '../../../utils/apiClient'
import { useEditorContext } from '../../../context/editor'
import { openPage } from '@nanostores/router'
import { router } from '../../../stores/router'

export const DraftsView = () => {
  const { isAuthenticated, isSessionLoaded, user } = useSession()

  const [drafts, setDrafts] = createSignal<Shout[]>([])

  const loadDrafts = async () => {
    const loadedDrafts = await apiClient.getDrafts()
    setDrafts(loadedDrafts)
  }

  onMount(() => {
    loadDrafts()
  })

  const {
    actions: { publishShoutById, deleteShout }
  } = useEditorContext()

  const handleDraftDelete = (shout: Shout) => {
    const result = deleteShout(shout.id)
    if (result) {
      loadDrafts()
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

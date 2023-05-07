import { createSignal, For, onMount, Show } from 'solid-js'
import { PageLayout } from '../components/_shared/PageLayout'
import { useSession } from '../context/session'
import { Shout } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'
import { getPagePath } from '@nanostores/router'
import { router } from '../stores/router'

export const DraftsPage = () => {
  const { isAuthenticated, isSessionLoaded, user } = useSession()

  const [drafts, setDrafts] = createSignal<Shout[]>([])

  onMount(async () => {
    const loadedDrafts = await apiClient.getDrafts()
    setDrafts(loadedDrafts)
  })

  return (
    <PageLayout>
      <Show when={isSessionLoaded()}>
        <div class="wide-container">
          <div class="row">
            <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
              <Show when={isAuthenticated()} fallback="Давайте авторизуемся">
                <For each={drafts()}>
                  {(draft) => (
                    <div>
                      <a href={getPagePath(router, 'edit', { shoutSlug: draft.slug })}>{draft.id}</a>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </PageLayout>
  )
}

export const Page = DraftsPage

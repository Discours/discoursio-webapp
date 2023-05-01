import { createSignal, For, onMount, Show } from 'solid-js'
import { PageLayout } from '../components/_shared/PageLayout'
import { useSession } from '../context/session'
import { Shout } from '../graphql/types.gen'
import { apiClient } from '../utils/apiClient'

export const DraftsPage = () => {
  const { isAuthenticated, isSessionLoaded, user } = useSession()

  const [drafts, setDrafts] = createSignal<Shout[]>([])

  onMount(async () => {
    const loadedDrafts = await apiClient.getShouts({
      filters: {
        author: user().slug,
        visibility: 'owner'
      },
      limit: 9999
    })
    setDrafts(loadedDrafts)
  })

  return (
    <PageLayout>
      <Show when={isSessionLoaded()}>
        <Show when={isAuthenticated()} fallback="Давайте авторизуемся">
          <For each={drafts()}>{(draft) => <div>{draft.title}</div>}</For>
        </Show>
      </Show>
    </PageLayout>
  )
}

export const Page = DraftsPage

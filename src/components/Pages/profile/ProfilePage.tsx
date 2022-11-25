import { PageWrap } from '../../_shared/PageWrap'
import { AuthorView, PRERENDERED_ARTICLES_COUNT } from '../../Views/Author'
import type { PageProps } from '../../types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadShouts, resetSortedArticles } from '../../../stores/zine/articles'
import { loadAuthor } from '../../../stores/zine/authors'
import { Loading } from '../../Loading'
import { useSession } from '../../../context/session'
import type { Author } from '../../../graphql/types.gen'

export const ProfilePage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.shouts))
  const { session } = useSession()
  const profile = createMemo(() => session().user)

  // TODO: ass editing controls

  onMount(async () => {
    if (isLoaded()) {
      return
    }
    await loadShouts({ filters: { author: profile().slug }, limit: PRERENDERED_ARTICLES_COUNT })
    await loadAuthor({ slug: profile().slug })
    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <AuthorView author={profile() as Author} shouts={props.shouts} />
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default ProfilePage

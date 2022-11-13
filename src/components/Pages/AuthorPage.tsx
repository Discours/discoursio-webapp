import { PageWrap } from '../Wraps/PageWrap'
import { AuthorView, PRERENDERED_ARTICLES_COUNT } from '../Views/Author'
import type { PageProps } from '../types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadAuthorArticles, resetSortedArticles } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'
import { loadAuthor } from '../../stores/zine/authors'
import { Loading } from '../Loading'

export const AuthorPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.shouts) && Boolean(props.author))

  const slug = createMemo(() => {
    const { page: getPage } = useRouter()

    const page = getPage()

    if (page.route !== 'author') {
      throw new Error('ts guard')
    }

    return page.params.slug
  })

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadAuthorArticles({ authorSlug: slug(), limit: PRERENDERED_ARTICLES_COUNT })
    await loadAuthor({ slug: slug() })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <AuthorView author={props.author} authorArticles={props.shouts} authorSlug={slug()} />
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default AuthorPage

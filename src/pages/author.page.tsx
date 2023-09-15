import { PageLayout } from '../components/_shared/PageLayout'
import { AuthorView, PRERENDERED_ARTICLES_COUNT } from '../components/Views/Author'
import type { PageProps } from './types'
import { createEffect, createMemo, createSignal, on, onCleanup, onMount, Show } from 'solid-js'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'
import { useRouter } from '../stores/router'
import { loadAuthor } from '../stores/zine/authors'
import { Loading } from '../components/_shared/Loading'
import { ReactionsProvider } from '../context/reactions'

export const AuthorPage = (props: PageProps) => {
  const { page } = useRouter()
  const slug = createMemo(() => page().params['slug'] as string)

  const [isLoaded, setIsLoaded] = createSignal(
    Boolean(props.authorShouts) && Boolean(props.author) && props.author.slug === slug()
  )

  const preload = () => {
    return Promise.all([
      loadShouts({
        filters: { author: slug(), visibility: 'community' },
        limit: PRERENDERED_ARTICLES_COUNT
      }),
      loadAuthor({ slug: slug() })
    ])
  }

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await preload()

    setIsLoaded(true)
  })

  createEffect(
    on(
      () => slug(),
      async () => {
        setIsLoaded(false)
        resetSortedArticles()
        await preload()
        setIsLoaded(true)
      },
      { defer: true }
    )
  )

  onCleanup(() => resetSortedArticles())

  const usePrerenderedData = props.author?.slug === slug()

  return (
    <PageLayout>
      <ReactionsProvider>
        <Show when={isLoaded()} fallback={<Loading />}>
          <AuthorView
            author={usePrerenderedData ? props.author : null}
            shouts={usePrerenderedData ? props.authorShouts : null}
            authorSlug={slug()}
          />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = AuthorPage

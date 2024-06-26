import type { PageProps } from './types'

import { Show, createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js'

import { AuthorView, PRERENDERED_ARTICLES_COUNT } from '../components/Views/Author'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'
import { useRouter } from '../stores/router'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'
import { loadAuthor } from '../stores/zine/authors'

export const AuthorPage = (props: PageProps) => {
  const { t } = useLocalize()
  const { page } = useRouter()
  const slug = createMemo(() => page().params['slug'] as string)

  const [isLoaded, setIsLoaded] = createSignal(
    Boolean(props.authorShouts) && Boolean(props.author) && props.author.slug === slug(),
  )

  createEffect(
    on(slug, async (s) => {
      if (s) {
        setIsLoaded(false)
        resetSortedArticles()
        await loadShouts({
          filters: { author: s, featured: false },
          limit: PRERENDERED_ARTICLES_COUNT,
        })
        await loadAuthor({ slug: s })
        setIsLoaded(true)
      }
    }),
  )

  onCleanup(() => resetSortedArticles())

  return (
    <PageLayout title={props.seo?.title || t('Discours')}>
      <ReactionsProvider>
        <Show when={isLoaded()} fallback={<Loading />}>
          <AuthorView authorSlug={slug()} />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = AuthorPage

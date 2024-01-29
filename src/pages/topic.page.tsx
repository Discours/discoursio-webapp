import type { PageProps } from './types'

import { createEffect, createMemo, createSignal, on, onCleanup, onMount, Show } from 'solid-js'

import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { PRERENDERED_ARTICLES_COUNT, TopicView } from '../components/Views/Topic'
import { ReactionsProvider } from '../context/reactions'
import { useRouter } from '../stores/router'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'
import { loadTopic } from '../stores/zine/topics'

export const TopicPage = (props: PageProps) => {
  const { page } = useRouter()
  const slug = createMemo(() => page().params['slug'] as string)
  const [isLoaded, setIsLoaded] = createSignal()

  createEffect(() => {
    const x = Boolean(props.topicShouts) && Boolean(props.topic) && props.topic.slug === slug()
    setIsLoaded(x)
  })

  const preload = () =>
    Promise.all([
      loadShouts({
        filters: { topic: slug(), published: true },
        limit: PRERENDERED_ARTICLES_COUNT,
        offset: 0,
      }),
      loadTopic({ slug: slug() }),
    ])

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
      { defer: true },
    ),
  )

  onCleanup(() => resetSortedArticles())

  const usePrerenderedData = createMemo(() => props.topic?.slug === slug())

  return (
    <PageLayout title={props.seo.title}>
      <ReactionsProvider>
        <Show when={isLoaded()} fallback={<Loading />}>
          <TopicView
            topic={usePrerenderedData() ? props.topic : null}
            shouts={usePrerenderedData() ? props.topicShouts : null}
            topicSlug={slug()}
          />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = TopicPage

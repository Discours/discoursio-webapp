import type { PageProps } from './types'

import { Show, createEffect, createMemo, createSignal, on, onCleanup, onMount } from 'solid-js'

import { PRERENDERED_ARTICLES_COUNT, TopicView } from '../components/Views/Topic'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { ReactionsProvider } from '../context/reactions'
import { useRouter } from '../stores/router'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'

export const TopicPage = (props: PageProps) => {
  const { page } = useRouter()
  const slug = createMemo(() => page().params['slug'] as string)

  const [isLoaded, setIsLoaded] = createSignal(
    Boolean(props.topicShouts) && Boolean(props.topic) && props.topic.slug === slug(),
  )

  const preload = () =>
    Promise.all([
      loadShouts({
        filters: { topic: slug(), featured: true },
        limit: PRERENDERED_ARTICLES_COUNT,
        offset: 0,
      }),
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

  const usePrerenderedData = props.topic?.slug === slug()

  return (
    <PageLayout title={props.seo?.title}>
      <ReactionsProvider>
        <Show when={isLoaded()} fallback={<Loading />}>
          <TopicView
            topic={usePrerenderedData ? props.topic : null}
            shouts={usePrerenderedData ? props.topicShouts : null}
            topicSlug={slug()}
          />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = TopicPage

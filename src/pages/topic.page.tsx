import type { PageProps } from './types'

import { createEffect, createMemo, createSignal, on, onCleanup, onMount } from 'solid-js'

import { PageLayout } from '../components/_shared/PageLayout'
import { PRERENDERED_ARTICLES_COUNT, TopicView } from '../components/Views/Topic'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'
import { useRouter } from '../stores/router'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'
import { loadTopic } from '../stores/zine/topics'

export const TopicPage = (props: PageProps) => {
  const { page } = useRouter()
  const { t } = useLocalize()
  const slug = createMemo(() => page().params['slug'] as string)

  const [isLoaded, setIsLoaded] = createSignal(
    Boolean(props.topicShouts) && Boolean(props.topic) && props.topic.slug === slug(),
  )
  const [pageTitle, setPageTitle] = createSignal<string>()
  const preload = () =>
    Promise.all([
      loadShouts({ filters: { topic: slug() }, limit: PRERENDERED_ARTICLES_COUNT, offset: 0 }),
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

  const usePrerenderedData = props.topic?.slug === slug()

  return (
    <PageLayout title={pageTitle()}>
      <ReactionsProvider>
        <TopicView
          title={(title) => setPageTitle(title)}
          isLoaded={isLoaded()}
          topic={usePrerenderedData ? props.topic : null}
          shouts={usePrerenderedData ? props.topicShouts : null}
          topicSlug={slug()}
        />
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = TopicPage

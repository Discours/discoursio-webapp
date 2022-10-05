import { MainLayout } from '../Layouts/MainLayout'
import { TopicView } from '../Views/Topic'
import type { PageProps } from '../types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadArticlesForTopics, resetSortedArticles } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'
import { t } from '../../utils/intl'
import { loadTopic } from '../../stores/zine/topics'

export const TopicPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.authorArticles) && Boolean(props.author))

  const slug = createMemo(() => {
    const { getPage } = useRouter()

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

    await loadArticlesForTopics({ topicSlugs: [slug()] })
    await loadTopic({ slug: slug() })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <MainLayout>
      <Show when={isLoaded()} fallback={t('Loading')}>
        <TopicView topic={props.topic} topicArticles={props.topicArticles} topicSlug={slug()} />
      </Show>
    </MainLayout>
  )
}

// for lazy loading
export default TopicPage

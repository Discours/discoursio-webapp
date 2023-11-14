import { PageLayout } from '../components/_shared/PageLayout'
import { AllTopicsView } from '../components/Views/AllTopics'
import type { PageProps } from './types'
import { createSignal, onMount, Show } from 'solid-js'
import { loadAllTopics } from '../stores/zine/topics'
import { Loading } from '../components/_shared/Loading'
import { useLocalize } from '../context/localize'

export const AllTopicsPage = (props: PageProps) => {
  const { t } = useLocalize()

  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.allTopics))

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadAllTopics()
    setIsLoaded(true)
  })

  return (
    <PageLayout title={t('All topics')}>
      <Show when={isLoaded()} fallback={<Loading />}>
        <AllTopicsView topics={props.allTopics} />
      </Show>
    </PageLayout>
  )
}

export const Page = AllTopicsPage

import { MainLayout } from '../Layouts/MainLayout'
import { AllTopicsView } from '../Views/AllTopics'
import type { PageProps } from '../types'
import { createSignal, onMount, Show } from 'solid-js'
import { t } from '../../utils/intl'
import { loadAllTopics } from '../../stores/zine/topics'

export const AllTopicsPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.allTopics))

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadAllTopics()
    setIsLoaded(true)
  })

  return (
    <MainLayout>
      <Show when={isLoaded()} fallback={t('Loading')}>
        <AllTopicsView topics={props.allTopics} />
      </Show>
    </MainLayout>
  )
}

// for lazy loading
export default AllTopicsPage

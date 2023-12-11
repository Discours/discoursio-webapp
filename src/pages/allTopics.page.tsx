import type { PageProps } from './types'

import { createSignal, onMount } from 'solid-js'

import { PageLayout } from '../components/_shared/PageLayout'
import { AllTopicsView } from '../components/Views/AllTopics'
import { useLocalize } from '../context/localize'
import { loadAllTopics } from '../stores/zine/topics'

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
      <AllTopicsView isLoaded={isLoaded()} topics={props.allTopics} />
    </PageLayout>
  )
}

export const Page = AllTopicsPage

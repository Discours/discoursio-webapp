import type { PageProps } from './types'

import { createSignal, onMount } from 'solid-js'

import { AllTopics } from '../components/Views/AllTopics'
import { PageLayout } from '../components/_shared/PageLayout'
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
    <PageLayout title={t('Themes and plots')}>
      <AllTopics isLoaded={isLoaded()} topics={props.allTopics} />
    </PageLayout>
  )
}

export const Page = AllTopicsPage

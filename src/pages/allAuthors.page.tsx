import type { PageProps } from './types'

import { createSignal, onMount } from 'solid-js'

import { PageLayout } from '../components/_shared/PageLayout'
import { AllAuthorsView } from '../components/Views/AllAuthors'
import { useLocalize } from '../context/localize'
import { loadAllAuthors } from '../stores/zine/authors'

export const AllAuthorsPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>()

  const { t } = useLocalize()

  onMount(async () => {
    const loaded = Boolean(props.allAuthors)
    if (loaded) {
      setIsLoaded(loaded)
      return
    }

    await loadAllAuthors()
    setIsLoaded(true)
  })

  return (
    <PageLayout title={t('Authors')}>
      <AllAuthorsView isLoaded={isLoaded()} authors={props.allAuthors} />
    </PageLayout>
  )
}

export const Page = AllAuthorsPage

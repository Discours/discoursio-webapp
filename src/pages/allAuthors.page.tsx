import type { PageProps } from './types'

import { createEffect, createSignal, onMount } from 'solid-js'

import { AllAuthors } from '../components/Views/AllAuthors/'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { loadAllAuthors } from '../stores/zine/authors'

export const AllAuthorsPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.allAuthors))

  const { t } = useLocalize()

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadAllAuthors()
    setIsLoaded(true)
  })

  createEffect(() => {
    console.log('!!! isLoaded():', isLoaded())
  })

  return (
    <PageLayout title={t('Authors')}>
      <AllAuthors isLoaded={isLoaded()} authors={props.allAuthors} />
    </PageLayout>
  )
}

export const Page = AllAuthorsPage

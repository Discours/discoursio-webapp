import { PageLayout } from '../components/_shared/PageLayout'
import { AllAuthorsView } from '../components/Views/AllAuthors'
import type { PageProps } from './types'
import { createSignal, onMount, Show } from 'solid-js'
import { loadAllAuthors } from '../stores/zine/authors'
import { Loading } from '../components/_shared/Loading'

import { useLocalize } from '../context/localize'

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

  return (
    <PageLayout title={t('Authors')}>
      <Show when={isLoaded()} fallback={<Loading />}>
        <AllAuthorsView authors={props.allAuthors} />
      </Show>
    </PageLayout>
  )
}

export const Page = AllAuthorsPage

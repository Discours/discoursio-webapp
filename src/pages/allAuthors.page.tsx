import type { PageProps } from './types'

import { createSignal, onMount } from 'solid-js'

import { AllAuthors } from '../components/Views/AllAuthors/'
import { PAGE_SIZE } from '../components/Views/AllTopics/AllTopics'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { loadAllAuthors, loadAuthors } from '../stores/zine/authors'

export const AllAuthorsPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(
    Boolean(props.allAuthors && props.topFollowedAuthors && props.topWritingAuthors),
  )

  const { t } = useLocalize()

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadAllAuthors()
    await loadAuthors({ by: { order: 'shouts' }, limit: PAGE_SIZE, offset: 0 })
    await loadAuthors({ by: { order: 'followers' }, limit: PAGE_SIZE, offset: 0 })
    setIsLoaded(true)
  })

  return (
    <PageLayout title={t('Authors')}>
      <AllAuthors
        isLoaded={isLoaded()}
        authors={props.allAuthors}
        topWritingAuthors={props.topWritingAuthors}
        topFollowedAuthors={props.topFollowedAuthors}
      />
    </PageLayout>
  )
}

export const Page = AllAuthorsPage

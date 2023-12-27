import type { PageProps } from './types'

import { createSignal, onMount } from 'solid-js'

import { PageLayout } from '../components/_shared/PageLayout'
import { ShowOnlyOnClient } from '../components/_shared/ShowOnlyOnClient'
import { InboxView } from '../components/Views/Inbox'
import { InboxProvider } from '../context/inbox'
import { useLocalize } from '../context/localize'
import { loadAllAuthors } from '../stores/zine/authors'

export const InboxPage = (props: PageProps) => {
  const { t } = useLocalize()
  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.allAuthors))

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadAllAuthors()
    setIsLoaded(true)
  })
  return (
    <PageLayout hideFooter={true} title={t('Inbox')}>
      <ShowOnlyOnClient>
        <InboxProvider>
          <InboxView isLoaded={isLoaded()} authors={props.allAuthors} />
        </InboxProvider>
      </ShowOnlyOnClient>
    </PageLayout>
  )
}

export const Page = InboxPage

import { PageLayout } from '../components/_shared/PageLayout'
import { InboxView } from '../components/Views/Inbox'
import { InboxProvider } from '../context/inbox'
import { ShowOnlyOnClient } from '../components/_shared/ShowOnlyOnClient'

export const InboxPage = () => {
  return (
    <PageLayout hideFooter={true}>
      <ShowOnlyOnClient>
        <InboxProvider>
          <InboxView />
        </InboxProvider>
      </ShowOnlyOnClient>
    </PageLayout>
  )
}

export const Page = InboxPage

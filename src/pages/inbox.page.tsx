import { PageLayout } from '../components/_shared/PageLayout'
import { InboxView } from '../components/Views/Inbox'
import { InboxProvider } from '../context/inbox'
import { ShowOnlyOnClient } from '../components/_shared/ShowOnlyOnClient'
import { useLocalize } from '../context/localize'

export const InboxPage = () => {
  const { t } = useLocalize()

  return (
    <PageLayout hideFooter={true} title={t('Inbox')}>
      <ShowOnlyOnClient>
        <InboxProvider>
          <InboxView />
        </InboxProvider>
      </ShowOnlyOnClient>
    </PageLayout>
  )
}

export const Page = InboxPage

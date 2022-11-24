import { PageWrap } from '../_shared/PageWrap'
import { InboxView } from '../Views/Inbox'
import { InboxProvider } from '../../context/inbox'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'

export const InboxPage = () => {
  return (
    <PageWrap hideFooter={true}>
      <ShowOnlyOnClient>
        <InboxProvider>
          <InboxView />
        </InboxProvider>
      </ShowOnlyOnClient>
    </PageWrap>
  )
}

// for lazy loading
export default InboxPage

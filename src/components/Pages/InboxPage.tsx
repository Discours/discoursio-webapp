import { PageWrap } from '../_shared/PageWrap'
import { InboxView } from '../Views/Inbox'

export const InboxPage = () => {
  return (
    <PageWrap hideFooter={true}>
      <InboxView />
    </PageWrap>
  )
}

// for lazy loading
export default InboxPage

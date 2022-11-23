import { PageWrap } from '../_shared/PageWrap'
import { InboxView } from '../Views/Inbox'
import type { PageProps } from '../types'

export const InboxPage = (props: PageProps) => {
  return (
    <PageWrap hideFooter={true}>
      <InboxView />
    </PageWrap>
  )
}

// for lazy loading
export default InboxPage

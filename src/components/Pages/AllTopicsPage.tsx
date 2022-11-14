import { PageWrap } from '../_shared/PageWrap'
import { AllTopicsView } from '../Views/AllTopics'
import type { PageProps } from '../types'
import { ClientContainer } from '../_shared/ClientContainer'

export const AllTopicsPage = (props: PageProps) => {
  return (
    <PageWrap>
      <ClientContainer>
        <AllTopicsView topics={props.allTopics} />
      </ClientContainer>
    </PageWrap>
  )
}

// for lazy loading
export default AllTopicsPage

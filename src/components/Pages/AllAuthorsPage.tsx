import { PageWrap } from '../_shared/PageWrap'
import { AllAuthorsView } from '../Views/AllAuthors'
import type { PageProps } from '../types'
import { ClientContainer } from '../_shared/ClientContainer'

export const AllAuthorsPage = (props: PageProps) => {
  return (
    <PageWrap>
      <ClientContainer>
        <AllAuthorsView authors={props.allAuthors} />
      </ClientContainer>
    </PageWrap>
  )
}

// for lazy loading
export default AllAuthorsPage

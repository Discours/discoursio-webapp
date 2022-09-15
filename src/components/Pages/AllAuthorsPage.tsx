import { MainLayout } from '../Layours/MainLayout'
import { AllAuthorsView } from '../Views/AllAuthors'
import type { PageProps } from '../types'

export const AllAuthorsPage = (props: PageProps) => {
  return (
    <MainLayout>
      <AllAuthorsView authors={props.authors} />
    </MainLayout>
  )
}

// for lazy loading
export default AllAuthorsPage

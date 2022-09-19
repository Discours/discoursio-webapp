import { MainLayout } from '../Layouts/MainLayout'
import { AllTopicsView } from '../Views/AllTopics'
import type { PageProps } from '../types'

export const AllTopicsPage = (props: PageProps) => {
  return (
    <MainLayout>
      <AllTopicsView topics={props.topics} />
    </MainLayout>
  )
}

// for lazy loading
export default AllTopicsPage

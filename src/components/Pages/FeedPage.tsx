import { MainLayout } from '../Layouts/MainLayout'
import { FeedView } from '../Views/Feed'
import type { PageProps } from '../types'

export const FeedPage = (props: PageProps) => {
  return (
    <MainLayout>
      <FeedView articles={props.articles} />
    </MainLayout>
  )
}

// for lazy loading
export default FeedPage

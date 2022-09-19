import { MainLayout } from '../Layouts/MainLayout'
import { TopicView } from '../Views/Topic'
import type { PageProps } from '../types'

export const TopicPage = (props: PageProps) => {
  return (
    <MainLayout>
      <TopicView topic={props.topic} topicArticles={props.articles} />
    </MainLayout>
  )
}

// for lazy loading
export default TopicPage

import { HomeView } from '../Views/Home'
import { MainLayout } from '../Layouts/MainLayout'
import type { PageProps } from '../types'

export const HomePage = (props: PageProps) => {
  return (
    <MainLayout>
      <HomeView recentPublishedArticles={props.articles || []} />
    </MainLayout>
  )
}

// for lazy loading
export default HomePage

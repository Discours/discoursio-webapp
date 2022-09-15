import { MainLayout } from '../Layouts/MainLayout'
import { AuthorView } from '../Views/Author'
import type { PageProps } from '../types'

export const AuthorPage = (props: PageProps) => {
  return (
    <MainLayout>
      <AuthorView author={props.author} authorArticles={props.articles} />
    </MainLayout>
  )
}

// for lazy loading
export default AuthorPage

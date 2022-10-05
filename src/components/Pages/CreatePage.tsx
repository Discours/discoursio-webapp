import { MainLayout } from '../Layouts/MainLayout'
import { CreateView } from '../Views/Create'

export const CreatePage = () => {
  return (
    <MainLayout>
      <CreateView />
    </MainLayout>
  )
}

// for lazy loading
export default CreatePage

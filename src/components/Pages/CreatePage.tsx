import { newState } from '../Editor/store'
import { MainLayout } from '../Layouts/MainLayout'
import { CreateView } from '../Views/Create'

export const CreatePage = () => {
  return (
    <MainLayout>
      <CreateView state={newState()} />
    </MainLayout>
  )
}

// for lazy loading
export default CreatePage

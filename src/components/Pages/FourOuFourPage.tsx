import { FourOuFourView } from '../Views/FourOuFour'
import { MainLayout } from '../Layouts/MainLayout'

export const FourOuFourPage = () => {
  return (
    <MainLayout isHeaderFixed={false}>
      <FourOuFourView />
    </MainLayout>
  )
}

// for lazy loading
export default FourOuFourPage

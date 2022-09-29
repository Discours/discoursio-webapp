import { FourOuFourView } from '../Views/FourOuFour'
import { MainLayout } from '../Layouts/MainLayout'

export const FourOuFourPage = () => {
  return (
    <MainLayout isHeaderFixed={false} hideFooter={true}>
      <FourOuFourView />
    </MainLayout>
  )
}

// for lazy loading
export default FourOuFourPage

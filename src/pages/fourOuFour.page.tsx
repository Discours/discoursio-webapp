import { FourOuFourView } from '../components/Views/FourOuFour'
import { PageLayout } from '../components/_shared/PageLayout'

export const FourOuFourPage = () => {
  return (
    <PageLayout isHeaderFixed={false} hideFooter={true}>
      <FourOuFourView />
    </PageLayout>
  )
}

export const Page = FourOuFourPage

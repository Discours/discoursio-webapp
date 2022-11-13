import { FourOuFourView } from '../Views/FourOuFour'
import { PageWrap } from '../Wraps/PageWrap'

export const FourOuFourPage = () => {
  return (
    <PageWrap isHeaderFixed={false} hideFooter={true}>
      <FourOuFourView />
    </PageWrap>
  )
}

// for lazy loading
export default FourOuFourPage

import { FourOuFourView } from '../Views/FourOuFour'
import { MainWrap } from '../Wrap/MainWrap'

export const FourOuFourPage = () => {
  return (
    <MainWrap isHeaderFixed={false} hideFooter={true}>
      <FourOuFourView />
    </MainWrap>
  )
}

// for lazy loading
export default FourOuFourPage

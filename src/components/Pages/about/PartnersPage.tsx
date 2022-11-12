import { MainWrap } from '../../Wrap/MainWrap'
import { t } from '../../../utils/intl'

// const title = t('Partners')

export const PartnersPage = () => {
  return (
    <MainWrap>
      <article class="container container--static-page">
        <div class="row">
          <div class="col-md-6 col-xl-7 shift-content order-md-first">
            <h1>{t('Partners')}</h1>
          </div>
        </div>
      </article>
    </MainWrap>
  )
}

// for lazy loading
export default PartnersPage

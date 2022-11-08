import { MainLayout } from '../../Layouts/MainLayout'
import { t } from '../../../utils/intl'

// const title = t('Partners')

export const PartnersPage = () => {
  return (
    <MainLayout>
      <article class="container container--static-page">
        <div class="row">
          <div class="col-md-8 col-lg-7 col-xl-8 shift-content order-md-first">
            <h1>{t('Partners')}</h1>
          </div>
        </div>
      </article>
    </MainLayout>
  )
}

// for lazy loading
export default PartnersPage

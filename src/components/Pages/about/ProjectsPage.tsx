import { PageWrap } from '../../_shared/PageWrap'
import { t } from '../../../utils/intl'

// title={t('Projects')}>

export const ProjectsPage = () => {
  return (
    <PageWrap>
      <article class="container container--static-page">
        <div class="row">
          <div class="col-md-6 col-xl-7 shift-content order-md-first">
            <h1>{t('Projects')}</h1>
          </div>
        </div>
      </article>
    </PageWrap>
  )
}

// for lazy loading
export default ProjectsPage

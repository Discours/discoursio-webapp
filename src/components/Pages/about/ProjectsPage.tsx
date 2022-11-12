import { MainWrap } from '../../Wrap/MainWrap'
import { t } from '../../../utils/intl'

// title={t('Projects')}>

export const ProjectsPage = () => {
  return (
    <MainWrap>
      <article class="container container--static-page">
        <div class="row">
          <div class="col-md-6 col-xl-7 shift-content order-md-first">
            <h1>{t('Projects')}</h1>
          </div>
        </div>
      </article>
    </MainWrap>
  )
}

// for lazy loading
export default ProjectsPage

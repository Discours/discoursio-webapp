import { MainLayout } from '../../Layouts/MainLayout'
import { t } from '../../../utils/intl'

// title={t('Projects')}>

export const ProjectsPage = () => {
  return (
    <MainLayout>
      <article class="container">
        <div class="row">
          <div class="col-md-8 offset-md-2">{t('Projects')}</div>
          <div class="col-md-8 col-lg-6 offset-md-3" />
        </div>
      </article>
    </MainLayout>
  )
}

// for lazy loading
export default ProjectsPage

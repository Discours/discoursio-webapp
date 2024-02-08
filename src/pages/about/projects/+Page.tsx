import { PageLayout } from '../../../components/_shared/PageLayout'
import { useLocalize } from '../../../context/localize'

export const ProjectsPage = () => {
  const { t } = useLocalize()
  return (
    <PageLayout title={t('Projects')}>
      <article class="wide-container container--static-page">
        <div class="row">
          <div class="col-md-12 col-xl-14 offset-md-5 order-md-first">
            <h1>{t('Projects')}</h1>
          </div>
        </div>
      </article>
    </PageLayout>
  )
}
export const Page = ProjectsPage

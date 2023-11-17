import { PageLayout } from '../components/_shared/PageLayout'
import { DraftsView } from '../components/Views/DraftsView'
import { useLocalize } from '../context/localize'

export const DraftsPage = () => {
  const { t } = useLocalize()

  return (
    <PageLayout title={t('Drafts')}>
      <DraftsView />
    </PageLayout>
  )
}

export const Page = DraftsPage

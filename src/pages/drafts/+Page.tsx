import { DraftsView } from '../../components/Views/DraftsView'
import { PageLayout } from '../../components/_shared/PageLayout'
import { useLocalize } from '../../context/localize'

export const DraftsPage = () => {
  const { t } = useLocalize()

  return (
    <PageLayout title={t('Drafts')}>
      <DraftsView />
    </PageLayout>
  )
}

export const Page = DraftsPage

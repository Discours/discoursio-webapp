import { PageLayout } from '../components/_shared/PageLayout'

import { useLocalize } from '../context/localize'
import { DraftsView } from '../components/Views/DraftsView'

export const DraftsPage = () => {
  const { t } = useLocalize()

  return (
    <PageLayout title={t('Drafts')}>
      <DraftsView />
    </PageLayout>
  )
}

export const Page = DraftsPage

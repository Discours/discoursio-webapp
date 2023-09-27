import { PageLayout } from '../components/_shared/PageLayout'
import { Title } from '@solidjs/meta'
import { useLocalize } from '../context/localize'
import { DraftsView } from '../components/Views/DraftsView'

export const DraftsPage = () => {
  const { t } = useLocalize()

  return (
    <PageLayout>
      <Title>{t('Drafts')}</Title>
      <DraftsView />
    </PageLayout>
  )
}

export const Page = DraftsPage

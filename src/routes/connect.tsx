import { ConnectView } from '~/components/Views/ConnectView'
import { useLocalize } from '~/context/localize'
import { PageLayout } from '../components/_shared/PageLayout'

export const ConnectPage = () => {
  const { t } = useLocalize()
  return (
    <PageLayout title={t('Suggest an idea')}>
      <ConnectView />
    </PageLayout>
  )
}

export const Page = ConnectPage

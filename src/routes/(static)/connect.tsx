import { ConnectView } from '~/components/Views/ConnectView'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'

export const ConnectPage = () => {
  const { t } = useLocalize()
  return (
    <PageLayout title={t('Suggest an idea')}>
      <ConnectView />
    </PageLayout>
  )
}

export default ConnectPage

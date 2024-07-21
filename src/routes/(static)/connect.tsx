import { ConnectView } from '~/components/Views/ConnectView'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'

export default () => {
  const { t } = useLocalize()
  return (
    <PageLayout title={t('Suggest an idea')}>
      <ConnectView />
    </PageLayout>
  )
}

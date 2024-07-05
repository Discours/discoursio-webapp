import { HttpStatusCode } from '@solidjs/start'
import { FourOuFourView } from '../components/Views/FourOuFour'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'

export default () => {
  const { t } = useLocalize()

  return (
    <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
      <FourOuFourView />
      <HttpStatusCode code={404} />
    </PageLayout>
  )
}

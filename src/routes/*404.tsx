import { HttpStatusCode } from '@solidjs/start'
import { onMount } from 'solid-js'
import { FourOuFourView } from '../components/Views/FourOuFour'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'

export default () => {
  const { t } = useLocalize()
  onMount(() => console.info('404 page'))
  return (
    <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
      <FourOuFourView />
      <HttpStatusCode code={404} />
    </PageLayout>
  )
}

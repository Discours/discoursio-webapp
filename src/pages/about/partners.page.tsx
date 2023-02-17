import { PageLayout } from '../../components/_shared/PageLayout'
import { useLocalize } from '../../context/localize'
import { Title } from '@solidjs/meta'

export const PartnersPage = () => {
  const { t } = useLocalize()
  return (
    <PageLayout>
      <Title>{t('Partners')}</Title>
      <article class="wide-container container--static-page">
        <div class="row">
          <div class="col-md-6 col-xl-7 shift-content order-md-first">
            <h1>{t('Partners')}</h1>
          </div>
        </div>
      </article>
    </PageLayout>
  )
}

export const Page = PartnersPage

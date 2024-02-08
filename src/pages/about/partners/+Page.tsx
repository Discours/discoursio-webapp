import { Meta } from '@solidjs/meta'

import { StaticPage } from '../../../components/Views/StaticPage'
import { useLocalize } from '../../../context/localize'
import { getImageUrl } from '../../../utils/getImageUrl'

export const PartnersPage = () => {
  const { t } = useLocalize()

  const ogTitle = t('Partners')
  const ogImage = getImageUrl('production/image/logo_image.png')
  const description = t('Discours Partners')

  return (
    <StaticPage title={ogTitle}>
      <article class="wide-container container--static-page">
        <Meta name="descprition" content={description} />
        <Meta name="keywords" content={t('keywords')} />
        <Meta name="og:type" content="article" />
        <Meta name="og:title" content={ogTitle} />
        <Meta name="og:image" content={ogImage} />
        <Meta name="twitter:image" content={ogImage} />
        <Meta name="og:description" content={description} />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:title" content={ogTitle} />
        <Meta name="twitter:description" content={description} />
        <div class="row">
          <div class="col-md-12 col-xl-14 offset-md-5 order-md-first">
            <h1>{t('Partners')}</h1>
          </div>
        </div>
      </article>
    </StaticPage>
  )
}

export const Page = PartnersPage

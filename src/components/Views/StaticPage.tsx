import { Meta } from '@solidjs/meta'
import { JSX, createMemo } from 'solid-js'
import { useLocalize } from '~/context/localize'
import enKeywords from '~/intl/locales/en/keywords.json'
import ruKeywords from '~/intl/locales/ru/keywords.json'
import { processJSXElement } from '~/intl/prepositions'
import { getImageUrl } from '~/lib/getImageUrl'
import { TableOfContents } from '../TableOfContents'
import { PageLayout } from '../_shared/PageLayout'

type Props = {
  title: string
  desc?: string
  children: JSX.Element
}
export const StaticPage = (props: Props) => {
  let articleBodyElement: HTMLElement | null = null
  const { t, lang } = useLocalize()
  const ogTitle = createMemo(() => t(props.title || 'Discours'))
  const description = createMemo(() => t(props.desc || ''))
  const ogImage = getImageUrl('production/image/logo_image.png')
  const keywords = createMemo(() => {
    const page = props.title.toLocaleLowerCase() as keyof typeof ruKeywords
    return `${lang() === 'ru' ? ruKeywords[page] : enKeywords[page]}`
  })

  return (
    <PageLayout title={props.title}>
      <Meta name="descprition" content={description()} />
      <Meta name="keywords" content={keywords()} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle()} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="og:description" content={description()} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle()} />
      <Meta name="twitter:description" content={description()} />
      <h1>
        <span class="wrapped">{ogTitle()}</span>
      </h1>
      <article
        class="wide-container container--static-page"
        id="articleBody"
        ref={(el) => (articleBodyElement = el)}
      >
        <div class="row">
          <div class="col-md-12 col-xl-14 offset-md-5 order-md-first">
            {processJSXElement(props.children)}
          </div>

          <div class="col-md-6 col-lg-4 order-md-last">
            <TableOfContents
              variant="article"
              parentSelector="#articleBody"
              body={(articleBodyElement as unknown as HTMLElement)?.outerHTML}
            />
          </div>
        </div>
      </article>
    </PageLayout>
  )
}

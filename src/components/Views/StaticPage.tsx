import { JSX } from 'solid-js'

import { TableOfContents } from '../TableOfContents'
import { PageLayout } from '../_shared/PageLayout'

type Props = {
  title: string
  children: JSX.Element
}
export const StaticPage = (props: Props) => {
  let articleBodyElement: HTMLElement | null = null

  return (
    <PageLayout title={props.title}>
      <article
        class="wide-container container--static-page"
        id="articleBody"
        ref={(el) => (articleBodyElement = el)}
      >
        <div class="row">
          <div class="col-md-12 col-xl-14 offset-md-5 order-md-first">{props.children}</div>

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

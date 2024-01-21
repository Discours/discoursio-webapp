import { JSX } from 'solid-js'

import { PageLayout } from '../_shared/PageLayout'
import { TableOfContents } from '../TableOfContents'

type Props = {
  title: string
  children: JSX.Element
}
export const StaticPage = (props: Props) => {
  const articleBodyElement: { current: HTMLElement } = { current: null }

  return (
    <PageLayout title={props.title}>
      <div class="wide-container">
        <div class="row">
          <article
            class="col-md-16 col-lg-14 col-xl-12 offset-md-5"
            id="articleBody"
            ref={(el) => (articleBodyElement.current = el)}
          >
            {props.children}
          </article>

          <div class="col-md-6 offset-md-1">
            <TableOfContents
              variant="article"
              parentSelector="#articleBody"
              body={articleBodyElement.current.outerHTML}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

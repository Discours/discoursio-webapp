import { PageLayout } from '../_shared/PageLayout'
import { TableOfContents } from '../TableOfContents'
import { JSX } from 'solid-js'

export const StaticPage = (props: {
  title: string
  children: JSX.Element
  layoutChildren: JSX.Element
}) => {
  let articleBodyElement: HTMLElement | undefined

  return (
    <PageLayout title={props.title}>
      {props.layoutChildren}
      <div class="wide-container">
        <div class="row">
          <article
            class="col-md-16 col-lg-14 col-xl-12 offset-md-5"
            id="articleBody"
            ref={articleBodyElement}
          >
            {props.children}
          </article>

          <div class="col-md-6 offset-md-1">
            <TableOfContents
              variant="article"
              parentSelector="#articleBody"
              body={articleBodyElement.outerHTML}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

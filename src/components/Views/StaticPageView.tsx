import { JSX, onMount } from 'solid-js'
import { processPrepositions } from '~/intl/prepositions'
import { PageLayout } from '../_shared/PageLayout'
import { TableOfContents } from '../_shared/TableOfContents'

type Props = {
  title: string
  desc?: string
  children: JSX.Element
}

export const StaticPage = (props: Props) => {
  let bodyEl: HTMLElement | undefined
  onMount(() => {
    if (bodyEl) bodyEl.innerHTML = processPrepositions(bodyEl.innerHTML)
  })
  return (
    <PageLayout title={props.title} desc={props.desc} key={props.title.toLowerCase()}>
      <article class="wide-container container--static-page" id="articleBody" ref={(el) => (bodyEl = el)}>
        <div class="row">
          <div class="col-md-12 col-xl-14 offset-md-5 order-md-first">
            <h1>{props.title}</h1>
            {props.children}
          </div>

          <div class="col-md-6 col-lg-4 order-md-last">
            <TableOfContents
              variant="article"
              parentSelector="#articleBody"
              body={(bodyEl as unknown as HTMLElement)?.outerHTML}
            />
          </div>
        </div>
      </article>
    </PageLayout>
  )
}

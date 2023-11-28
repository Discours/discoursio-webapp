import type { Shout } from '../../graphql/schema/core.gen'

import { createComputed, createSignal, Show, For } from 'solid-js'

import { ArticleCard } from './ArticleCard'
import { ArticleCardProps } from './ArticleCard/ArticleCard'

const x = [
  ['12', '12'],
  ['8', '16'],
  ['16', '8'],
]

export const Row2 = (props: {
  articles: Shout[]
  isEqual?: boolean
  nodate?: boolean
  noAuthorLink?: boolean
  noauthor?: boolean
}) => {
  const [y, setY] = createSignal(0)

  // FIXME: random can break hydration
  createComputed(() => setY(Math.floor(Math.random() * x.length)))

  return (
    <Show when={props.articles && props.articles.length > 0}>
      <div class="floor">
        <div class="wide-container">
          <div class="row">
            <For each={props.articles}>
              {(a, i) => {
                // FIXME: refactor this, too ugly now
                const className = `col-md-${props.isEqual ? '12' : x[y()][i()]}`
                let desktopCoverSize: ArticleCardProps['desktopCoverSize']

                switch (className) {
                  case 'col-md-8': {
                    desktopCoverSize = 'S'
                    break
                  }
                  case 'col-md-12': {
                    desktopCoverSize = 'M'
                    break
                  }
                  default: {
                    desktopCoverSize = 'L'
                  }
                }

                return (
                  <div class={className}>
                    <ArticleCard
                      article={a}
                      settings={{
                        isWithCover: props.isEqual || x[y()][i()] === '16',
                        nodate: props.isEqual || props.nodate,
                        noAuthorLink: props.noAuthorLink,
                        noauthor: props.noauthor,
                      }}
                      desktopCoverSize={desktopCoverSize}
                    />
                  </div>
                )
              }}
            </For>
          </div>
        </div>
      </div>
    </Show>
  )
}

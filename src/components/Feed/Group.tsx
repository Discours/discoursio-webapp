import type { JSX } from 'solid-js/jsx-runtime'
import { For, Show } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './ArticleCard'
import './Group.scss'

interface GroupProps {
  articles: Shout[]
  header?: JSX.Element
}

export default (props: GroupProps) => {
  if (!props.articles) props.articles = []
  return (
    <div class="floor floor--important floor--group">
      <Show when={props.articles.length > 4}>
        <div class="wide-container">
          <div class="row">
            <div class="group__header col-24">{props.header}</div>

            <div class="col-lg-12">
              <ArticleCard
                article={props.articles[0]}
                settings={{
                  nosubtitle: false,
                  noicon: true,
                  isFloorImportant: true,
                  isBigTitle: true,
                  nodate: true,
                }}
              />
            </div>

            <div class="col-lg-12">
              <div class="row">
                <Show when={props.articles.length < 4}>
                  <For each={props.articles.slice(1, props.articles.length)}>
                    {(a) => (
                      <div class="row">
                        <div class="col-md-16">
                          <ArticleCard
                            article={a}
                            settings={{ nosubtitle: false, noicon: true, isBigTitle: true, nodate: true }}
                          />
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={props.articles.length >= 4}>
                  <div class="col-md-12">
                    <For each={props.articles.slice(1, 3)}>
                      {(a) => (
                        <ArticleCard
                          article={a}
                          settings={{
                            noicon: true,
                            noimage: true,
                            isBigTitle: true,
                            isCompact: true,
                            isFloorImportant: true,
                            nodate: true,
                          }}
                        />
                      )}
                    </For>
                  </div>
                  <div class="col-md-12">
                    <For each={props.articles.slice(3, 5)}>
                      {(a) => (
                        <ArticleCard
                          article={a}
                          settings={{
                            noicon: true,
                            noimage: true,
                            isBigTitle: true,
                            isCompact: true,
                            isFloorImportant: true,
                            nodate: true,
                          }}
                        />
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

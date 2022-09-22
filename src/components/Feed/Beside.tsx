// TODO: additional entities list column + article

import { For, Show } from 'solid-js/web'
import { ArticleCard } from './Card'
import { AuthorCard } from '../Author/Card'
import { TopicCard } from '../Topic/Card'
import './Beside.scss'
import type { Author, Shout, Topic, User } from '../../graphql/types.gen'
import { Icon } from '../Nav/Icon'
import { t } from '../../utils/intl'

interface BesideProps {
  title: string
  values: any[]
  beside: Shout
  wrapper: 'topic' | 'author' | 'article' | 'top-article'
  isTopicCompact?: boolean
  topicShortDescription?: boolean
  topicsBySlug?: { [slug: string]: Topic }
}

export default (props: BesideProps) => {
  return (
    <Show when={!!props.beside?.slug && props.values?.length > 0}>
      <div class="floor floor--9">
        <div class="wide-container row">
          <Show when={!!props.values}>
            <div class="col-md-4">
              <Show when={!!props.title}>
                <div class="beside-column-title">
                  <h4>{props.title}</h4>

                  <Show when={props.wrapper === 'author'}>
                    <a href="/user/list">
                      {t('All authors')}
                      <Icon name="arrow-right" />
                    </a>
                  </Show>
                </div>
              </Show>
              <ul class="beside-column">
                <For each={[...props.values]}>
                  {(value: Partial<Shout | User | Topic>) => (
                    <li classList={{ top: props.wrapper.startsWith('top-') }}>
                      <Show when={props.wrapper === 'topic'}>
                        <TopicCard
                          topic={value as Topic}
                          compact={props.isTopicCompact}
                          shortDescription={props.topicShortDescription}
                        />
                      </Show>
                      <Show when={props.wrapper === 'author'}>
                        <AuthorCard author={value as Author} compact={true} hasLink={true} />
                      </Show>
                      <Show when={props.wrapper === 'article' && value?.slug}>
                        <ArticleCard article={value as Shout} settings={{ noimage: true }} />
                      </Show>
                      <Show when={props.wrapper === 'top-article' && value?.slug}>
                        <ArticleCard
                          article={value as Shout}
                          settings={{ noimage: true, noauthor: true, nodate: true }}
                        />
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Show>
          <div class="col-md-8">
            <ArticleCard article={props.beside} settings={{}} />
          </div>
        </div>
      </div>
    </Show>
  )
}

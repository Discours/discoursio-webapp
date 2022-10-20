// TODO: additional entities list column + article

import { For, Show } from 'solid-js/web'
import { ArticleCard } from './Card'
import { AuthorCard } from '../Author/Card'
import { TopicCard } from '../Topic/Card'
import style from './Beside.module.scss'
import type { Author, Shout, Topic, User } from '../../graphql/types.gen'
import { Icon } from '../Nav/Icon'
import { t } from '../../utils/intl'

interface BesideProps {
  title?: string
  values: (Shout | User | Topic | Author)[]
  beside: Shout
  wrapper: 'topic' | 'author' | 'article' | 'top-article'
  isTopicCompact?: boolean
  isTopicInRow?: boolean
  topicShortDescription?: boolean
  topicsBySlug?: { [slug: string]: Topic }
  iconButton?: boolean
}

export default (props: BesideProps) => {
  return (
    <Show when={!!props.beside?.slug && props.values?.length > 0}>
      <div class="floor floor--9">
        <div class="wide-container row">
          <Show when={!!props.values}>
            <div class="col-md-4">
              <Show when={!!props.title}>
                <div class={style.besideColumnTitle}>
                  <h4>{props.title}</h4>

                  <Show when={props.wrapper === 'author'}>
                    <a href="/user/list">
                      {t('All authors')}
                      <Icon name="arrow-right" />
                    </a>
                  </Show>
                </div>
              </Show>
              <ul class={style.besideColumn}>
                <For each={[...props.values]}>
                  {(value: Partial<Shout | User | Topic>) => (
                    <li classList={{ [style.top]: props.wrapper.startsWith('top-') }}>
                      <Show when={props.wrapper === 'topic'}>
                        <TopicCard
                          topic={value as Topic}
                          compact={props.isTopicCompact}
                          shortDescription={props.topicShortDescription}
                          isTopicInRow={props.isTopicInRow}
                          iconButton={props.iconButton}
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
                          settings={{ noimage: true, noauthor: true, nodate: true, isShort: true }}
                        />
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Show>
          <div class="col-md-8">
            <ArticleCard article={props.beside} settings={{ isBigTitle: true }} />
          </div>
        </div>
      </div>
    </Show>
  )
}

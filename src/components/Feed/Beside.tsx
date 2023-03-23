// TODO: additional entities list column + article

import { For, Show } from 'solid-js'
import { ArticleCard } from './Card'
import { AuthorCard } from '../Author/Card'
import { TopicCard } from '../Topic/Card'
import styles from './Beside.module.scss'
import type { Author, Shout, Topic, User } from '../../graphql/types.gen'
import { Icon } from '../_shared/Icon'

import { clsx } from 'clsx'
import { useLocalize } from '../../context/localize'

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
  nodate?: boolean
}

export const Beside = (props: BesideProps) => {
  const { t } = useLocalize()
  return (
    <Show when={!!props.beside?.slug && props.values?.length > 0}>
      <div class="floor floor--9">
        <div class="wide-container">
          <div class="row">
            <Show when={!!props.values}>
              <div class="col-md-4">
                <Show when={!!props.title}>
                  <div class={styles.besideColumnTitle}>
                    <h4>{props.title}</h4>

                    <Show when={props.wrapper === 'author'}>
                      <a href="/authors">
                        {t('All authors')}
                        <Icon name="arrow-right" class={styles.icon} />
                      </a>
                    </Show>

                    <Show when={props.wrapper === 'topic'}>
                      <a href="/topics">
                        {t('All topics')}
                        <Icon name="arrow-right" class={styles.icon} />
                      </a>
                    </Show>
                  </div>
                </Show>
                <ul class={styles.besideColumn}>
                  <For each={[...props.values]}>
                    {(value: Partial<Shout | User | Topic>) => (
                      <li classList={{ [styles.top]: props.wrapper.startsWith('top-') }}>
                        <Show when={props.wrapper === 'topic'}>
                          <TopicCard
                            topic={value as Topic}
                            compact={props.isTopicCompact}
                            shortDescription={props.topicShortDescription}
                            isTopicInRow={props.isTopicInRow}
                            iconButton={props.iconButton}
                            showPublications={true}
                          />
                        </Show>
                        <Show when={props.wrapper === 'author'}>
                          <AuthorCard
                            author={value as Author}
                            hideWriteButton={true}
                            hasLink={true}
                            truncateBio={true}
                          />
                        </Show>
                        <Show when={props.wrapper === 'article' && value?.slug}>
                          <ArticleCard
                            article={value as Shout}
                            settings={{ noimage: true, nodate: props.nodate }}
                          />
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
            <div class={clsx('col-md-8', styles.shoutCardContainer)}>
              <ArticleCard
                article={props.beside}
                settings={{ isBigTitle: true, isBeside: true, nodate: props.nodate }}
              />
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}

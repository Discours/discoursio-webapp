import { Show, createMemo } from 'solid-js'
import type { Author, Reaction, Shout } from '../../graphql/types.gen'
import Row2 from '../Feed/Row2'
import Row3 from '../Feed/Row3'
import Beside from '../Feed/Beside'
import AuthorFull from '../Author/Full'
import { t } from '../../utils/intl'
import { useAuthorsStore } from '../../stores/zine/authors'
import { params } from '../../stores/router'
import { useArticlesStore } from '../../stores/zine/articles'

import '../../styles/Topic.scss'
import { useStore } from '@nanostores/solid'
import { useTopicsStore } from '../../stores/zine/topics'

// TODO: load reactions on client
type AuthorProps = {
  authorArticles: Shout[]
  author: Author
  // FIXME author topics fro server
  // topics: Topic[]
}

export const AuthorPage = (props: AuthorProps) => {
  const { getSortedArticles: articles } = useArticlesStore({
    sortedArticles: props.authorArticles
  })
  const { getAuthorEntities: authors } = useAuthorsStore({ authors: [props.author] })
  const { getTopicsByAuthor } = useTopicsStore()

  const author = createMemo(() => authors()[props.author.slug])
  const args = useStore(params)

  //const slug = createMemo(() => author().slug)
  /*
  const slug = createMemo<string>(() => {
    let slug = props?.slug
    if (props?.slug.startsWith('@')) slug = slug.replace('@', '')
    return slug
  })
  */

  const title = createMemo(() => {
    const m = args()['by']
    if (m === 'viewed') return t('Top viewed')
    if (m === 'rating') return t('Top rated')
    if (m === 'commented') return t('Top discussed')
    return t('Top recent')
  })

  return (
    <div class="container author-page">
      <Show when={author()} fallback={<div class="center">{t('Loading')}</div>}>
        <AuthorFull author={author()} />
        <div class="row group__controls">
          <div class="col-md-8">
            <ul class="view-switcher">
              <li classList={{ selected: !args()['by'] || args()['by'] === 'recent' }}>
                <button type="button" onClick={() => (args()['by'] = 'recent')}>
                  {t('Recent')}
                </button>
              </li>
              <li classList={{ selected: args()['by'] === 'rating' }}>
                <button type="button" onClick={() => (args()['by'] = 'rating')}>
                  {t('Popular')}
                </button>
              </li>
              <li classList={{ selected: args()['by'] === 'viewed' }}>
                <button type="button" onClick={() => (args()['by'] = 'viewed')}>
                  {t('Views')}
                </button>
              </li>
              <li classList={{ selected: args()['by'] === 'commented' }}>
                <button type="button" onClick={() => (args()['by'] = 'commented')}>
                  {t('Discussing')}
                </button>
              </li>
            </ul>
          </div>
          <div class="col-md-4">
            <div class="mode-switcher">
              {`${t('Show')} `}
              <span class="mode-switcher__control">{t('All posts')}</span>
            </div>
          </div>
        </div>

        <div class="floor">
          <h3 class="col-12">{title()}</h3>
          <div class="row">
            <Show when={articles()?.length > 0}>
              <Beside
                title={t('Topics which supported by author')}
                values={getTopicsByAuthor()[author().slug].slice(0, 5)}
                beside={articles()[0]}
                wrapper={'topic'}
                topicShortDescription={true}
              />
              <Row3 articles={articles().slice(1, 4)} />
              <Row2 articles={articles().slice(4, 6)} />
              <Row3 articles={articles().slice(10, 13)} />
              <Row3 articles={articles().slice(13, 16)} />
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}

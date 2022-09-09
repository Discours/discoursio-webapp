import { Show, createMemo, createSignal, createEffect } from 'solid-js'
import type { Author, Shout, Topic } from '../../graphql/types.gen'
import Row2 from '../Feed/Row2'
import Row3 from '../Feed/Row3'
import AuthorFull from '../Author/Full'
import { t } from '../../utils/intl'
import { useAuthorsStore } from '../../stores/zine/authors'
import { params as paramsStore } from '../../stores/router'
import { useArticlesStore } from '../../stores/zine/articles'

import '../../styles/Topic.scss'
import Beside from '../Feed/Beside'
import { useStore } from '@nanostores/solid'

type AuthorProps = {
  authorArticles: Shout[]
  author: Author
}

export const AuthorPage = (props: AuthorProps) => {
  const params = useStore(paramsStore)
  const { getSortedArticles: articles, getArticlesByAuthors: articlesByAuthors } = useArticlesStore({
    sortedArticles: props.authorArticles
  })
  const { getAuthorEntities: authors } = useAuthorsStore([props.author])
  const author = createMemo(() => authors()[props.author.slug])
  const slug = createMemo(() => author().slug)
  /*
  const slug = createMemo<string>(() => {
    let slug = props?.slug
    if (props?.slug.startsWith('@')) slug = slug.replace('@', '')
    return slug
  })
  */
  const [authorTopics, setAuthorTopics] = createSignal<Partial<Topic>[]>([])
  createEffect(() => {
    if (authorTopics().length === 0 && articles().length > 0) {
      const r = [] as Topic[]
      articlesByAuthors()[slug()].forEach((a: Shout) => {
        a.topics.forEach((topic: Topic) => {
          if (!r.some((t) => t.slug === topic.slug)) r.push(topic)
        })
      })
      setAuthorTopics(r)
    }
  }, [articles()])
  const title = createMemo(() => {
    const m = params()['by']
    if (m === 'viewed') return t('Top viewed')
    if (m === 'rating') return t('Top rated')
    if (m === 'commented') return t('Top discussed')
    return t('Top recent')
  })

  const setBy = (what: string) => {
    params()['by'] = what
  }

  return (
    <div class="container author-page">
      <Show when={author()} fallback={<div class="center">{t('Loading')}</div>}>
        <AuthorFull author={author()} />
        <div class="row group__controls">
          <div class="col-md-8">
            <ul class="view-switcher">
              <li classList={{ selected: !params()['by'] || params()['by'] === 'recent' }}>
                <button type="button" onClick={() => setBy('')}>
                  {t('Recent')}
                </button>
              </li>
              <li classList={{ selected: params()['by'] === 'rating' }}>
                <button type="button" onClick={() => setBy('rating')}>
                  {t('Popular')}
                </button>
              </li>
              <li classList={{ selected: params()['by'] === 'viewed' }}>
                <button type="button" onClick={() => setBy('viewed')}>
                  {t('Views')}
                </button>
              </li>
              <li classList={{ selected: params()['by'] === 'commented' }}>
                <button type="button" onClick={() => setBy('commented')}>
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
                values={authorTopics()?.slice(0, 5)}
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

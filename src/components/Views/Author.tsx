import { Show, createMemo, createSignal, For, onMount } from 'solid-js'
import type { Author, Shout } from '../../graphql/types.gen'
import { Row1 } from '../Feed/Row1'
import { Row2 } from '../Feed/Row2'
import { AuthorFull } from '../Author/Full'
import { t } from '../../utils/intl'
import { useAuthorsStore } from '../../stores/zine/authors'
import { loadShouts, useArticlesStore } from '../../stores/zine/articles'

import { useTopicsStore } from '../../stores/zine/topics'
import { useRouter } from '../../stores/router'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import { splitToPages } from '../../utils/splitToPages'
import { RatingControl } from '../Article/RatingControl'
import styles from './Author.module.scss'
import { clsx } from 'clsx'
import Userpic from '../Author/Userpic'
import { Popup } from '../_shared/Popup'
import { AuthorCard } from '../Author/Card'

// TODO: load reactions on client
type AuthorProps = {
  shouts: Shout[]
  author: Author
  authorSlug: string
  // FIXME author topics from server
  // topics: Topic[]
}

type AuthorPageSearchParams = {
  by: '' | 'viewed' | 'rating' | 'commented' | 'recent' | 'followed'
}

export const PRERENDERED_ARTICLES_COUNT = 12
const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const AuthorView = (props: AuthorProps) => {
  const { sortedArticles } = useArticlesStore({
    shouts: props.shouts
  })
  const { authorEntities } = useAuthorsStore({ authors: [props.author] })
  const { topicsByAuthor } = useTopicsStore()
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const author = createMemo(() => authorEntities()[props.authorSlug])
  const subscribers = new Array(12).fill(author())
  const { searchParams, changeSearchParam } = useRouter<AuthorPageSearchParams>()

  const loadMore = async () => {
    saveScrollPosition()
    const { hasMore } = await loadShouts({
      filters: { author: author().slug },
      limit: LOAD_MORE_PAGE_SIZE,
      offset: sortedArticles().length
    })
    setIsLoadMoreButtonVisible(hasMore)
    restoreScrollPosition()
  }

  onMount(async () => {
    if (sortedArticles().length === PRERENDERED_ARTICLES_COUNT) {
      loadMore()
    }
  })

  const title = createMemo(() => {
    const m = searchParams().by
    if (m === 'viewed') return t('Top viewed')
    if (m === 'rating') return t('Top rated')
    if (m === 'commented') return t('Top discussed')
    return t('Top recent')
  })

  const pages = createMemo<Shout[][]>(() =>
    splitToPages(sortedArticles(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE)
  )

  return (
    <div class="author-page">
      <Show when={author()} fallback={<div class="center">{t('Loading')}</div>}>
        <div class="wide-container">
          <AuthorFull author={author()} />
          <div class="row group__controls">
            <div class="col-md-8">
              <ul class="view-switcher">
                <li classList={{ selected: searchParams().by === 'rating' }}>
                  <button type="button" onClick={() => changeSearchParam('by', 'rating')}>
                    {t('Popular')}
                  </button>
                </li>
                <li classList={{ selected: searchParams().by === 'followed' }}>
                  <button type="button" onClick={() => changeSearchParam('by', 'followed')}>
                    {t('Followers')}
                  </button>
                </li>
                <li classList={{ selected: searchParams().by === 'commented' }}>
                  <button type="button" onClick={() => changeSearchParam('by', 'commented')}>
                    {t('Discussing')}
                  </button>
                </li>
              </ul>
            </div>
            <div class={clsx('col-md-4', styles.additionalControls)}>
              <Popup
                {...props}
                trigger={
                  <div class={styles.subscribers}>
                    <Userpic user={author()} class={styles.userpic} />
                    <Userpic user={author()} class={styles.userpic} />
                    <Userpic user={author()} class={styles.userpic} />
                    <div class={clsx(styles.userpic, styles.subscribersCounter)}>12</div>
                  </div>
                }
                variant="tiny"
              >
                <ul class={clsx('nodash', styles.subscribersList)}>
                  <For each={subscribers}>
                    {(item) => (
                      <li>
                        <AuthorCard author={item} hideDescription={true} hideFollow={true} hasLink={true} />
                      </li>
                    )}
                  </For>
                </ul>
              </Popup>

              <div class={styles.ratingContainer}>
                Карма
                <RatingControl rating={19} class={styles.ratingControl} />
              </div>
            </div>
          </div>
        </div>

        <Row1 article={sortedArticles()[0]} />
        <Row2 articles={sortedArticles().slice(1, 3)} isEqual={true} />
        <Row1 article={sortedArticles()[3]} />
        <Row2 articles={sortedArticles().slice(4, 6)} isEqual={true} />
        <Row1 article={sortedArticles()[6]} />
        <Row2 articles={sortedArticles().slice(7, 9)} isEqual={true} />

        <For each={pages()}>
          {(page) => (
            <>
              <Row1 article={page[0]} />
              <Row2 articles={page.slice(1, 3)} isEqual={true} />
              <Row1 article={page[3]} />
              <Row2 articles={page.slice(4, 6)} isEqual={true} />
              <Row1 article={page[6]} />
              <Row2 articles={page.slice(7, 9)} isEqual={true} />
            </>
          )}
        </For>

        <Show when={isLoadMoreButtonVisible()}>
          <p class="load-more-container">
            <button class="button" onClick={loadMore}>
              {t('Load more')}
            </button>
          </p>
        </Show>
      </Show>
    </div>
  )
}

import { For, Show, createMemo, onMount, createSignal } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { Row3 } from '../Feed/Row3'
import { Row2 } from '../Feed/Row2'
import { Beside } from '../Feed/Beside'
import styles from '../../styles/Topic.module.scss'
import { t } from '../../utils/intl'
import { useRouter } from '../../stores/router'
import { useArticlesStore } from '../../stores/zine/articles'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import { splitToPages } from '../../utils/splitToPages'
import { clsx } from 'clsx'
import Slider from '../Feed/Slider'
import { Row1 } from '../Feed/Row1'
import { loadLayoutShouts } from '../../stores/zine/layouts'

type LayoutPageSearchParams = {
  layout: 'audio' | 'video' | 'image' | 'literature'
}

interface LayoutProps {
  layout: string
  shouts: Shout[]
}

export const PRERENDERED_ARTICLES_COUNT = 21
const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const LayoutView = (props: LayoutProps) => {
  const { searchParams, changeSearchParam } = useRouter<LayoutPageSearchParams>()

  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const { sortedArticles } = useArticlesStore({ sortedArticles: props.shouts })
  const layout = createMemo(() => props.layout)

  const loadMoreLayout = async (kind: string) => {
    saveScrollPosition()

    const { hasMore } = await loadLayoutShouts({
      layout: kind,
      amount: LOAD_MORE_PAGE_SIZE,
      offset: sortedArticles().length
    })
    setIsLoadMoreButtonVisible(hasMore)

    restoreScrollPosition()
  }

  onMount(async () => {
    if (sortedArticles().length === PRERENDERED_ARTICLES_COUNT) {
      loadMoreLayout(searchParams().layout)
    }
  })

  const title = createMemo(() => {
    const l = searchParams().layout
    if (l === 'audio') return t('Audio')
    if (l === 'video') return t('Video')
    if (l === 'image') return t('Artworks')
    return t('Literature')
  })

  const pages = createMemo<Shout[][]>(() =>
    splitToPages(sortedArticles(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE)
  )

  const ModeSwitcher = () => (
    <div class="container">
      <div class={clsx(styles.groupControls, 'row group__controls')}>
        <div class="col-md-8">
          <ul class="view-switcher">
            <li classList={{ selected: searchParams().layout === 'audio' }}>
              <a href="/expo/audio">{t('Audio')}</a>
            </li>
            <li classList={{ selected: searchParams().layout === 'video' }}>
              <a href="/expo/video">{t('Video')}</a>
            </li>
            <li classList={{ selected: searchParams().layout === 'image' }}>
              <a href="/expo/image">{t('Artworks')}</a>
            </li>
            <li classList={{ selected: searchParams().layout === 'literature' || !searchParams().layout }}>
              <a href="/expo/literature">{t('Literature')}</a>
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
    </div>
  )

  return (
    <div class={styles.topicPage}>
      <Show when={layout()}>
        <h1>{title()}</h1>

        <ModeSwitcher />
        <Row1 article={sortedArticles()[0]} />
        <Row2 articles={sortedArticles().slice(1, 3)} />
        <Slider title={title()} articles={sortedArticles().slice(5, 11)} />
        <Beside
          beside={sortedArticles()[12]}
          title={t('Top viewed')}
          values={sortedArticles().slice(0, 5)}
          wrapper={'top-article'}
        />
        <Show when={sortedArticles().length > 5}>
          <Row3 articles={sortedArticles().slice(13, 16)} />
          <Row2 articles={sortedArticles().slice(16, 18)} />
          <Row3 articles={sortedArticles().slice(18, 21)} />
          <Row3 articles={sortedArticles().slice(21, 24)} />
          <Row3 articles={sortedArticles().slice(24, 27)} />
        </Show>

        <For each={pages()}>
          {(page) => (
            <>
              <Row3 articles={page.slice(0, 3)} />
              <Row3 articles={page.slice(3, 6)} />
              <Row3 articles={page.slice(6, 9)} />
            </>
          )}
        </For>

        <Show when={isLoadMoreButtonVisible()}>
          <p class="load-more-container">
            <button class="button" onClick={() => loadMoreLayout(searchParams().layout)}>
              {t('Load more')}
            </button>
          </p>
        </Show>
      </Show>
    </div>
  )
}

import { PageWrap } from '../_shared/PageWrap'
import type { PageProps } from '../types'
import { createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { loadShoutsBy, resetSortedArticles } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'
import { LayoutType, useLayoutsStore } from '../../stores/zine/layouts'
import { Loading } from '../Loading'
import { restoreScrollPosition, saveScrollPosition } from '../../utils/scroll'
import type { Shout } from '../../graphql/types.gen'
import { splitToPages } from '../../utils/splitToPages'
import clsx from 'clsx'
import { t } from '../../utils/intl'
import { Row3 } from '../Feed/Row3'
import { Row2 } from '../Feed/Row2'
import { Beside } from '../Feed/Beside'
import Slider from '../Feed/Slider'
import { Row1 } from '../Feed/Row1'
import styles from '../../styles/Topic.module.scss'

export const PRERENDERED_ARTICLES_COUNT = 21
const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const LayoutShoutsPage = (props: PageProps) => {
  const layout = createMemo<LayoutType>(() => {
    const { page: getPage } = useRouter()
    const page = getPage()
    if (page.route !== 'expo') throw new Error('ts guard')
    return page.params.layout as LayoutType
  })
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const { sortedLayoutShouts, loadLayoutShoutsBy } = useLayoutsStore(layout(), props.shouts)
  const sortedArticles = createMemo<Shout[]>(() => sortedLayoutShouts().get(layout()) || [])
  const loadMoreLayout = async (kind: LayoutType) => {
    saveScrollPosition()
    const { hasMore } = await loadLayoutShoutsBy({
      by: { layout: kind },
      limit: LOAD_MORE_PAGE_SIZE,
      offset: sortedArticles().length
    })
    setIsLoadMoreButtonVisible(hasMore)
    restoreScrollPosition()
  }

  onMount(async () => {
    if (sortedArticles().length === PRERENDERED_ARTICLES_COUNT) {
      loadMoreLayout(layout())
    }
  })

  const title = createMemo(() => {
    const l = layout()
    if (l === 'audio') return t('Audio')
    if (l === 'video') return t('Video')
    if (l === 'image') return t('Artworks')
    return t('Literature')
  })

  const pages = createMemo<Shout[][]>(() =>
    splitToPages(sortedArticles(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE)
  )
  const isLoaded = createMemo(() => Boolean(sortedArticles()))

  onMount(async () => {
    if (!isLoaded()) {
      await loadShoutsBy({ by: { layout: layout() }, limit: PRERENDERED_ARTICLES_COUNT, offset: 0 })
    }
  })

  onCleanup(() => resetSortedArticles())

  const ModeSwitcher = () => (
    <div class="container">
      <div class={clsx(styles.groupControls, 'row group__controls')}>
        <div class="col-md-8">
          <ul class="view-switcher">
            <li classList={{ selected: layout() === 'audio' }}>
              <a href="/expo/audio">{t('Audio')}</a>
            </li>
            <li classList={{ selected: layout() === 'video' }}>
              <a href="/expo/video">{t('Video')}</a>
            </li>
            <li classList={{ selected: layout() === 'image' }}>
              <a href="/expo/image">{t('Artworks')}</a>
            </li>
            <li classList={{ selected: layout() === 'literature' }}>
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
    <PageWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <div class={styles.topicPage}>
          <Show when={layout() && Boolean(sortedArticles())}>
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
                <button class="button" onClick={() => loadMoreLayout(layout())}>
                  {t('Load more')}
                </button>
              </p>
            </Show>
          </Show>
        </div>
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default LayoutShoutsPage

import { PageLayout } from '../components/_shared/PageLayout'
import type { LayoutType, PageProps } from './types'
import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js'
import { loadShouts, resetSortedArticles, useArticlesStore } from '../stores/zine/articles'
import { router, useRouter } from '../stores/router'
import { Loading } from '../components/_shared/Loading'
import { restoreScrollPosition, saveScrollPosition } from '../utils/scroll'
import type { Shout } from '../graphql/types.gen'
import { splitToPages } from '../utils/splitToPages'
import { clsx } from 'clsx'

import { Row3 } from '../components/Feed/Row3'
import { Row2 } from '../components/Feed/Row2'
import { Beside } from '../components/Feed/Beside'
import { Slider } from '../components/_shared/Slider'
import { Row1 } from '../components/Feed/Row1'
import styles from '../styles/Topic.module.scss'
import { ArticleCard } from '../components/Feed/ArticleCard'
import { useLocalize } from '../context/localize'
import { getPagePath } from '@nanostores/router'
import { Title } from '@solidjs/meta'
import { LoadShoutsOptions } from '../graphql/types.gen'

export const PRERENDERED_ARTICLES_COUNT = 27
const LOAD_MORE_PAGE_SIZE = 9 // Row3 + Row3 + Row3

export const LayoutShoutsPage = (props: PageProps) => {
  const { t } = useLocalize()
  const { page: getPage } = useRouter()

  const getLayout = createMemo<LayoutType>(() => getPage().params['layout'] as LayoutType)

  const [isLoaded, setIsLoaded] = createSignal(
    Boolean(props.layoutShouts) &&
      props.layoutShouts.length > 0 &&
      props.layoutShouts[0].layout === getLayout()
  )

  const { sortedArticles } = useArticlesStore({
    shouts: isLoaded() ? props.layoutShouts : []
  })

  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const loadMore = async (count) => {
    saveScrollPosition()
    const { hasMore } = await loadShouts({
      filters: { layout: getLayout() },
      limit: count,
      offset: sortedArticles().length
    })
    setIsLoadMoreButtonVisible(hasMore)
    restoreScrollPosition()
  }

  const title = createMemo(() => {
    const l = getLayout()
    if (l === 'audio') return t('Audio')
    if (l === 'video') return t('Video')
    if (l === 'image') return t('Artworks')
    return t('Literature')
  })

  const pages = createMemo<Shout[][]>(() =>
    splitToPages(sortedArticles(), PRERENDERED_ARTICLES_COUNT, LOAD_MORE_PAGE_SIZE)
  )

  onMount(() => {
    if (isLoaded()) {
      return
    }

    loadMore(PRERENDERED_ARTICLES_COUNT + LOAD_MORE_PAGE_SIZE)
    setIsLoaded(true)
  })

  onMount(() => {
    if (sortedArticles().length === PRERENDERED_ARTICLES_COUNT) {
      loadMore(LOAD_MORE_PAGE_SIZE)
    }
  })

  createEffect((prevLayout) => {
    if (prevLayout !== getLayout()) {
      resetSortedArticles()
      loadMore(PRERENDERED_ARTICLES_COUNT + LOAD_MORE_PAGE_SIZE)
    }

    return getLayout()
  }, getLayout())

  onCleanup(() => {
    resetSortedArticles()
  })

  const handleLoadMoreClick = () => {
    loadMore(LOAD_MORE_PAGE_SIZE)
  }

  return (
    <PageLayout>
      <Title>{title()}</Title>
      <Show when={isLoaded()} fallback={<Loading />}>
        <div class={styles.topicPage}>
          <Show when={getLayout()}>
            <div class="wide-container">
              <h1>{title()}</h1>
            </div>

            <div class="wide-container">
              <div class={clsx(styles.groupControls, 'row group__controls')}>
                <div class="col-md-16">
                  <ul class="view-switcher">
                    <li classList={{ 'view-switcher__item--selected': getLayout() === 'audio' }}>
                      <a href={getPagePath(router, 'expo', { layout: 'audio' })}>{t('Audio')}</a>
                    </li>
                    <li classList={{ 'view-switcher__item--selected': getLayout() === 'video' }}>
                      <a href={getPagePath(router, 'expo', { layout: 'video' })}>{t('Video')}</a>
                    </li>
                    <li classList={{ 'view-switcher__item--selected': getLayout() === 'image' }}>
                      <a href={getPagePath(router, 'expo', { layout: 'image' })}>{t('Artworks')}</a>
                    </li>
                    <li classList={{ 'view-switcher__item--selected': getLayout() === 'literature' }}>
                      <a href={getPagePath(router, 'expo', { layout: 'literature' })}>{t('Literature')}</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Show when={sortedArticles().length > 0} fallback={<Loading />}>
              <Row1 article={sortedArticles()[0]} />
              <Row2 articles={sortedArticles().slice(1, 3)} />
              <Slider title={title()}>
                <For each={sortedArticles().slice(5, 11)}>
                  {(article) => (
                    <ArticleCard
                      article={article}
                      settings={{
                        additionalClass: 'swiper-slide',
                        isFloorImportant: true,
                        isWithCover: true,
                        nodate: true
                      }}
                    />
                  )}
                </For>
              </Slider>
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
                  <button class="button" onClick={handleLoadMoreClick}>
                    {t('Load more')}
                  </button>
                </p>
              </Show>
            </Show>
          </Show>
        </div>
      </Show>
    </PageLayout>
  )
}

export const Page = LayoutShoutsPage

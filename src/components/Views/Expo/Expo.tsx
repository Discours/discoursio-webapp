import { getPagePath } from '@nanostores/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on, onCleanup, onMount } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { apiClient } from '../../../graphql/client/core'
import { LoadShoutsFilters, LoadShoutsOptions, Shout } from '../../../graphql/schema/core.gen'
import { LayoutType } from '../../../pages/types'
import { router } from '../../../stores/router'
import { loadShouts, resetSortedArticles, useArticlesStore } from '../../../stores/zine/articles'
import { getUnixtime } from '../../../utils/getServerDate'
import { restoreScrollPosition, saveScrollPosition } from '../../../utils/scroll'
import { splitToPages } from '../../../utils/splitToPages'
import { ArticleCard } from '../../Feed/ArticleCard'
import { Button } from '../../_shared/Button'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'
import { Loading } from '../../_shared/Loading'
import { ArticleCardSwiper } from '../../_shared/SolidSwiper/ArticleCardSwiper'

import styles from './Expo.module.scss'

type Props = {
  shouts: Shout[]
  layout: LayoutType
}

export const PRERENDERED_ARTICLES_COUNT = 36
const LOAD_MORE_PAGE_SIZE = 12

export const Expo = (props: Props) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.shouts))
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const [favoriteTopArticles, setFavoriteTopArticles] = createSignal<Shout[]>([])
  const [reactedTopMonthArticles, setReactedTopMonthArticles] = createSignal<Shout[]>([])

  const { t } = useLocalize()

  const { sortedArticles } = useArticlesStore({
    shouts: isLoaded() ? props.shouts : [],
    layout: props.layout,
  })

  const getLoadShoutsFilters = (additionalFilters: LoadShoutsFilters = {}): LoadShoutsFilters => {
    const filters = { ...additionalFilters }

    if (!filters.layouts) filters.layouts = []
    if (props.layout) {
      filters.layouts.push(props.layout)
    } else {
      filters.layouts.push('audio', 'video', 'image', 'literature')
    }

    return filters
  }

  const loadMore = async (count: number) => {
    const options: LoadShoutsOptions = {
      filters: getLoadShoutsFilters(),
      limit: count,
      offset: sortedArticles().length
    }

    options.filters = props.layout
      ? { layouts: [props.layout] }
      : { layouts: ['audio', 'video', 'image', 'literature'] }

    const { hasMore } = await loadShouts(options)
    setIsLoadMoreButtonVisible(hasMore)
  }

  const loadMoreWithoutScrolling = async (count: number) => {
    saveScrollPosition()
    await loadMore(count)
    restoreScrollPosition()
  }

  const loadRandomTopArticles = async () => {
    const options: LoadShoutsOptions = {
      filters: { ...getLoadShoutsFilters(), featured: true },
      limit: 10,
      random_limit: 100
    }
    const result = await apiClient.getRandomTopShouts({ options })
    setFavoriteTopArticles(result)
  }

  const loadRandomTopMonthArticles = async () => {
    const now = new Date()
    const after = getUnixtime(new Date(now.setMonth(now.getMonth() - 1)))

    const options: LoadShoutsOptions = {
      filters: { ...getLoadShoutsFilters({ after }), reacted: true },
      limit: 10,
      random_limit: 10
    }

    const result = await apiClient.getRandomTopShouts({ options })
    setReactedTopMonthArticles(result)
  }

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

    loadRandomTopArticles()
    loadRandomTopMonthArticles()
  })

  createEffect(
    on(
      () => props.layout,
      () => {
        resetSortedArticles()
        setFavoriteTopArticles([])
        setReactedTopMonthArticles([])
        loadMore(PRERENDERED_ARTICLES_COUNT + LOAD_MORE_PAGE_SIZE)
        loadRandomTopArticles()
        loadRandomTopMonthArticles()
      }
    )
  )

  onCleanup(() => {
    resetSortedArticles()
  })

  const handleLoadMoreClick = () => {
    loadMoreWithoutScrolling(LOAD_MORE_PAGE_SIZE)
  }

  return (
    <div class={styles.Expo}>
      <Show when={sortedArticles()?.length > 0} fallback={<Loading />}>
        <div class="wide-container">
          <ul class={clsx('view-switcher')}>
            <li class={clsx({ 'view-switcher__item--selected': !props.layout })}>
              <ConditionalWrapper
                condition={Boolean(props.layout)}
                wrapper={(children) => <a href={getPagePath(router, 'expo', { layout: '' })}>{children}</a>}
              >
                <span class={clsx('linkReplacement')}>{t('All')}</span>
              </ConditionalWrapper>
            </li>
            <li class={clsx({ 'view-switcher__item--selected': props.layout === 'literature' })}>
              <ConditionalWrapper
                condition={props.layout !== 'literature'}
                wrapper={(children) => (
                  <a href={getPagePath(router, 'expo', { layout: 'literature' })}>{children}</a>
                )}
              >
                <span class={clsx('linkReplacement')}>{t('Literature')}</span>
              </ConditionalWrapper>
            </li>
            <li class={clsx({ 'view-switcher__item--selected': props.layout === 'audio' })}>
              <ConditionalWrapper
                condition={props.layout !== 'audio'}
                wrapper={(children) => (
                  <a href={getPagePath(router, 'expo', { layout: 'audio' })}>{children}</a>
                )}
              >
                <span class={clsx('linkReplacement')}>{t('Music')}</span>
              </ConditionalWrapper>
            </li>
            <li class={clsx({ 'view-switcher__item--selected': props.layout === 'image' })}>
              <ConditionalWrapper
                condition={props.layout !== 'image'}
                wrapper={(children) => (
                  <a href={getPagePath(router, 'expo', { layout: 'image' })}>{children}</a>
                )}
              >
                <span class={clsx('linkReplacement')}>{t('Gallery')}</span>
              </ConditionalWrapper>
            </li>
            <li class={clsx({ 'view-switcher__item--selected': props.layout === 'video' })}>
              <ConditionalWrapper
                condition={props.layout !== 'video'}
                wrapper={(children) => (
                  <a href={getPagePath(router, 'expo', { layout: 'video' })}>{children}</a>
                )}
              >
                <span class={clsx('cursorPointer linkReplacement')}>{t('Video')}</span>
              </ConditionalWrapper>
            </li>
          </ul>
          <div class="row">
            <For each={sortedArticles().slice(0, LOAD_MORE_PAGE_SIZE)}>
              {(shout) => (
                <div class="col-md-6 mt-md-5 col-sm-8 mt-sm-3">
                  <ArticleCard
                    article={shout}
                    settings={{ nodate: true, nosubtitle: true, noAuthorLink: true }}
                    desktopCoverSize="XS"
                    withAspectRatio={true}
                  />
                </div>
              )}
            </For>
            <Show when={reactedTopMonthArticles()?.length > 0} keyed={true}>
              <ArticleCardSwiper title={t('Top month articles')} slides={reactedTopMonthArticles()} />
            </Show>
            <For each={sortedArticles().slice(LOAD_MORE_PAGE_SIZE, LOAD_MORE_PAGE_SIZE * 2)}>
              {(shout) => (
                <div class="col-md-6 mt-md-5 col-sm-8 mt-sm-3">
                  <ArticleCard
                    article={shout}
                    settings={{ nodate: true, nosubtitle: true, noAuthorLink: true }}
                    desktopCoverSize="XS"
                    withAspectRatio={true}
                  />
                </div>
              )}
            </For>
            <Show when={favoriteTopArticles()?.length > 0} keyed={true}>
              <ArticleCardSwiper title={t('Favorite')} slides={favoriteTopArticles()} />
            </Show>
            <For each={sortedArticles().slice(LOAD_MORE_PAGE_SIZE * 2)}>
              {(shout) => (
                <div class="col-md-6 mt-md-5 col-sm-8 mt-sm-3">
                  <ArticleCard
                    article={shout}
                    settings={{ nodate: true, nosubtitle: true, noAuthorLink: true }}
                    desktopCoverSize="XS"
                    withAspectRatio={true}
                  />
                </div>
              )}
            </For>
          </div>
          <Show when={isLoadMoreButtonVisible()}>
            <div class={styles.showMore}>
              <Button size="L" onClick={handleLoadMoreClick} value={t('Load more')} />
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}

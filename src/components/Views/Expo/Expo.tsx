import styles from './Expo.module.scss'
import { LoadShoutsOptions, Shout } from '../../../graphql/types.gen'
import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js'
import { ArticleCard } from '../../Feed/ArticleCard'
import { Loading } from '../../_shared/Loading'
import { Button } from '../../_shared/Button'
import { useLocalize } from '../../../context/localize'
import { router, useRouter } from '../../../stores/router'
import { LayoutType } from '../../../pages/types'
import { loadShouts, resetSortedArticles, useArticlesStore } from '../../../stores/zine/articles'
import { restoreScrollPosition, saveScrollPosition } from '../../../utils/scroll'
import { splitToPages } from '../../../utils/splitToPages'
import { clsx } from 'clsx'
import { getPagePath } from '@nanostores/router'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'

type Props = {
  shouts: Shout[]
}
export const PRERENDERED_ARTICLES_COUNT = 28
const LOAD_MORE_PAGE_SIZE = 16
export const Expo = (props: Props) => {
  const [isLoaded, setIsLoaded] = createSignal<boolean>(Boolean(props.shouts))
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)

  const { t } = useLocalize()
  const { page: getPage } = useRouter()
  const getLayout = createMemo<LayoutType>(() => getPage().params['layout'] as LayoutType)
  const { sortedArticles } = useArticlesStore({
    shouts: isLoaded() ? props.shouts : []
  })

  const loadMore = async (count) => {
    saveScrollPosition()
    const options: LoadShoutsOptions = {
      limit: count,
      offset: sortedArticles().length
    }

    options.filters = getLayout() ? { layout: getLayout() } : { excludeLayout: 'article' }

    const { hasMore } = await loadShouts(options)
    setIsLoadMoreButtonVisible(hasMore)
    restoreScrollPosition()
  }

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

  createEffect(
    on(
      () => getLayout(),
      () => {
        resetSortedArticles()
        loadMore(PRERENDERED_ARTICLES_COUNT + LOAD_MORE_PAGE_SIZE)
      },
      { defer: true }
    )
  )

  onCleanup(() => {
    resetSortedArticles()
  })

  const handleLoadMoreClick = () => {
    loadMore(LOAD_MORE_PAGE_SIZE)
  }

  return (
    <div class={styles.Expo}>
      <Show when={sortedArticles().length > 0} fallback={<Loading />}>
        <div class="wide-container">
          <ul class={clsx('view-switcher', styles.navigation)}>
            <li class={clsx({ 'view-switcher__item--selected': !getLayout() })}>
              <ConditionalWrapper
                condition={Boolean(getLayout())}
                wrapper={(children) => <a href={getPagePath(router, 'expo')}>{children}</a>}
              >
                <span class={clsx('linkReplacement')}>{t('All')}</span>
              </ConditionalWrapper>
            </li>
            <li class={clsx({ 'view-switcher__item--selected': getLayout() === 'literature' })}>
              <ConditionalWrapper
                condition={getLayout() !== 'literature'}
                wrapper={(children) => (
                  <a href={getPagePath(router, 'expoLayout', { layout: 'literature' })}>{children}</a>
                )}
              >
                <span class={clsx('linkReplacement')}>{t('Literature')}</span>
              </ConditionalWrapper>
            </li>
            <li class={clsx({ 'view-switcher__item--selected': getLayout() === 'music' })}>
              <ConditionalWrapper
                condition={getLayout() !== 'music'}
                wrapper={(children) => (
                  <a href={getPagePath(router, 'expoLayout', { layout: 'music' })}>{children}</a>
                )}
              >
                <span class={clsx('linkReplacement')}>{t('Music')}</span>
              </ConditionalWrapper>
            </li>
            <li class={clsx({ 'view-switcher__item--selected': getLayout() === 'image' })}>
              <ConditionalWrapper
                condition={getLayout() !== 'image'}
                wrapper={(children) => (
                  <a href={getPagePath(router, 'expoLayout', { layout: 'image' })}>{children}</a>
                )}
              >
                <span class={clsx('linkReplacement')}>{t('Gallery')}</span>
              </ConditionalWrapper>
            </li>
            <li class={clsx({ 'view-switcher__item--selected': getLayout() === 'video' })}>
              <ConditionalWrapper
                condition={getLayout() !== 'video'}
                wrapper={(children) => (
                  <a href={getPagePath(router, 'expoLayout', { layout: 'video' })}>{children}</a>
                )}
              >
                <span class={clsx('cursorPointer linkReplacement')}>{t('Video')}</span>
              </ConditionalWrapper>
            </li>
          </ul>
          <div class="row">
            <For each={sortedArticles().slice(0, PRERENDERED_ARTICLES_COUNT)}>
              {(shout) => (
                <div class="col-md-6 mt-md-5 col-sm-8 mt-sm-3">
                  <ArticleCard
                    article={shout}
                    settings={{ nodate: true, nosubtitle: true, noAuthorLink: true }}
                  />
                </div>
              )}
            </For>
            <For each={pages()}>
              {(page) => (
                <For each={page}>
                  {(shout) => (
                    <div class="col-md-6 mt-md-5 col-sm-8 mt-sm-3">
                      <ArticleCard
                        article={shout}
                        settings={{ nodate: true, nosubtitle: true, noAuthorLink: true }}
                      />
                    </div>
                  )}
                </For>
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

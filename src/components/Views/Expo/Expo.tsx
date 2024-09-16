import { A } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on, onCleanup, onMount } from 'solid-js'
import { ConditionalWrapper } from '~/components/_shared/ConditionalWrapper'
import { LoadMoreItems, LoadMoreWrapper } from '~/components/_shared/LoadMoreWrapper'
import { Loading } from '~/components/_shared/Loading'
import { ArticleCardSwiper } from '~/components/_shared/SolidSwiper/ArticleCardSwiper'
import { coreApiUrl } from '~/config'
import { EXPO_LAYOUTS, SHOUTS_PER_PAGE, useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { loadShouts } from '~/graphql/api/public'
import { graphqlClientCreate } from '~/graphql/client'
import getRandomTopShoutsQuery from '~/graphql/query/core/articles-load-random-top'
import { LoadShoutsFilters, LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { LayoutType } from '~/types/common'
import { getUnixtime } from '~/utils/date'
import { ArticleCard } from '../../Feed/ArticleCard'

import styles from './Expo.module.scss'

type Props = {
  shouts: Shout[]
  topMonthShouts?: Shout[]
  topRatedShouts?: Shout[]
  layout?: LayoutType
}

export const PRERENDERED_ARTICLES_COUNT = 36
const LOAD_MORE_PAGE_SIZE = 12

export const Expo = (props: Props) => {
  const { t } = useLocalize()
  const { session } = useSession()
  const client = createMemo(() => graphqlClientCreate(coreApiUrl, session()?.access_token))

  const [favoriteTopArticles, setFavoriteTopArticles] = createSignal<Shout[]>([])
  const [reactedTopMonthArticles, setReactedTopMonthArticles] = createSignal<Shout[]>([])
  const [expoShouts, setExpoShouts] = createSignal<Shout[]>([])
  const { feedByLayout, expoFeed, setExpoFeed } = useFeed()
  const layouts = createMemo<LayoutType[]>(() => (props.layout ? [props.layout] : EXPO_LAYOUTS))

  const loadMoreFiltered = async () => {
    const limit = SHOUTS_PER_PAGE
    const offset = (props.layout ? feedByLayout()[props.layout] : expoFeed())?.length
    const filters: LoadShoutsFilters = { layouts: layouts(), featured: true }
    const options: LoadShoutsOptions = { filters, limit, offset }
    const shoutsFetcher = loadShouts(options)
    const result = await shoutsFetcher()
    result && setExpoFeed(result)
    return result as LoadMoreItems
  }

  const loadRandomTopArticles = async () => {
    const options: LoadShoutsOptions = {
      filters: { layouts: layouts(), featured: true },
      limit: 10,
      random_limit: 100
    }
    const resp = await client()?.query(getRandomTopShoutsQuery, { options }).toPromise()
    setFavoriteTopArticles(resp?.data?.load_shouts_random_top || [])
  }

  const loadRandomTopMonthArticles = async () => {
    const now = new Date()
    const after = getUnixtime(new Date(now.setMonth(now.getMonth() - 1)))
    const options: LoadShoutsOptions = {
      filters: { layouts: layouts(), after, reacted: true },
      limit: 10,
      random_limit: 10
    }
    const resp = await client()?.query(getRandomTopShoutsQuery, { options }).toPromise()
    setReactedTopMonthArticles(resp?.data?.load_shouts_random_top || [])
  }

  onMount(() => {
    loadRandomTopArticles()
    loadRandomTopMonthArticles()
  })

  createEffect(
    on(
      () => props.layout,
      () => {
        setExpoShouts([])
        setFavoriteTopArticles([])
        setReactedTopMonthArticles([])
        loadRandomTopArticles()
        loadRandomTopMonthArticles()
      }
    )
  )

  onCleanup(() => {
    setExpoShouts([])
  })
  const ExpoTabs = () => (
    <div class="wide-container">
      <ul class={clsx('view-switcher')}>
        <li class={clsx({ 'view-switcher__item--selected': !props.layout })}>
          <A href={'/expo'}>
            <span class={clsx('linkReplacement')}>{t('All')}</span>
          </A>
        </li>
        <li class={clsx({ 'view-switcher__item--selected': props.layout === 'literature' })}>
          <ConditionalWrapper
            condition={props.layout !== 'literature'}
            wrapper={(children) => <A href={'/expo/literature'}>{children}</A>}
          >
            <span class={clsx('linkReplacement')}>{t('Literature')}</span>
          </ConditionalWrapper>
        </li>
        <li class={clsx({ 'view-switcher__item--selected': props.layout === 'audio' })}>
          <ConditionalWrapper
            condition={props.layout !== 'audio'}
            wrapper={(children) => <A href={'/expo/audio'}>{children}</A>}
          >
            <span class={clsx('linkReplacement')}>{t('Music')}</span>
          </ConditionalWrapper>
        </li>
        <li class={clsx({ 'view-switcher__item--selected': props.layout === 'image' })}>
          <ConditionalWrapper
            condition={props.layout !== 'image'}
            wrapper={(children) => <A href={'/expo/image'}>{children}</A>}
          >
            <span class={clsx('linkReplacement')}>{t('Gallery')}</span>
          </ConditionalWrapper>
        </li>
        <li class={clsx({ 'view-switcher__item--selected': props.layout === 'video' })}>
          <ConditionalWrapper
            condition={props.layout !== 'video'}
            wrapper={(children) => <A href={'/expo/video'}>{children}</A>}
          >
            <span class={clsx('cursorPointer linkReplacement')}>{t('Video')}</span>
          </ConditionalWrapper>
        </li>
      </ul>
    </div>
  )
  const ExpoGrid = () => (
    <div class="wide-container">
      <div class="row">
        <For each={props.shouts.slice(0, LOAD_MORE_PAGE_SIZE)}>
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
          <ArticleCardSwiper title={t('Top month')} slides={reactedTopMonthArticles()} />
        </Show>
        <For each={(props.topMonthShouts || []).slice(LOAD_MORE_PAGE_SIZE, LOAD_MORE_PAGE_SIZE * 2)}>
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
        <For each={props.topRatedShouts?.slice(LOAD_MORE_PAGE_SIZE * 2, expoShouts().length)}>
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
    </div>
  )

  return (
    <div class={styles.Expo}>
      <ExpoTabs />

      <Show when={expoShouts().length > 0} fallback={<Loading />}>
        <LoadMoreWrapper loadFunction={loadMoreFiltered} pageSize={LOAD_MORE_PAGE_SIZE}>
          <ExpoGrid />
        </LoadMoreWrapper>
      </Show>
    </div>
  )
}

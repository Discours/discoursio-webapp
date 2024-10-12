import { A } from '@solidjs/router'
import clsx from 'clsx'
import { For, Show, createEffect, createSignal, on } from 'solid-js'
import { Loading } from '~/components/_shared/Loading'
import { ArticleCardSwiper } from '~/components/_shared/SolidSwiper/ArticleCardSwiper'
import { EXPO_LAYOUTS, SHOUTS_PER_PAGE } from '~/context/feed'
import { EXPO_TITLES } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import getRandomTopShoutsQuery from '~/graphql/query/core/articles-load-random-top'
import { LoadShoutsOptions, Shout } from '~/graphql/schema/core.gen'
import { ExpoLayoutType } from '~/types/common'
import { getUnixtime } from '~/utils/date'
import { ArticleCard } from '../Feed/ArticleCard'

import styles from '~/styles/views/Expo.module.scss'

export const ExpoNav = (props: { layout: ExpoLayoutType | '' }) => {
  const { t } = useLocalize()

  return (
    <div class="wide-container">
      <ul class={clsx('view-switcher')}>
        <For each={[...EXPO_LAYOUTS, '']}>
          {(layoutKey) => (
            <li class={clsx({ 'view-switcher__item--selected': props.layout === layoutKey })}>
              {props.layout !== layoutKey ? (
                <A href={`/expo/${layoutKey}`}>
                  <span class="linkReplacement">
                    {layoutKey in EXPO_TITLES ? t(EXPO_TITLES[layoutKey as ExpoLayoutType]) : t('All')}
                  </span>
                </A>
              ) : (
                <span class="linkReplacement">
                  {layoutKey in EXPO_TITLES ? t(EXPO_TITLES[layoutKey as ExpoLayoutType]) : t('All')}
                </span>
              )}
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}

type Props = {
  shouts: Shout[]
  layout: ExpoLayoutType
}

export const Expo = (props: Props) => {
  const { t } = useLocalize()
  const { client } = useSession()
  const [favoriteTopArticles, setFavoriteTopArticles] = createSignal<Shout[]>([])
  const [reactedTopMonthArticles, setReactedTopMonthArticles] = createSignal<Shout[]>([])

  // Функция загрузки случайных избранных статей
  const loadRandomTopArticles = async () => {
    const layouts = props.layout ? [props.layout] : EXPO_LAYOUTS
    const options: LoadShoutsOptions = {
      filters: { layouts, featured: true },
      limit: 10,
      random_limit: 100
    }
    const resp = await client()?.query(getRandomTopShoutsQuery, { options }).toPromise()
    setFavoriteTopArticles(resp?.data?.load_shouts_random_top || [])
  }

  // Функция загрузки популярных статей за последний месяц
  const loadRandomTopMonthArticles = async () => {
    const layouts = props.layout ? [props.layout] : EXPO_LAYOUTS
    const now = new Date()
    const after = getUnixtime(new Date(now.setMonth(now.getMonth() - 1)))
    const options: LoadShoutsOptions = {
      filters: { layouts, after, reacted: true },
      limit: 10,
      random_limit: 10
    }
    const resp = await client()?.query(getRandomTopShoutsQuery, { options }).toPromise()
    setReactedTopMonthArticles(resp?.data?.load_shouts_random_top || [])
  }

  // Эффект для загрузки random top при изменении layout
  createEffect(
    on(
      () => props.layout,
      async (_layout?: ExpoLayoutType) => {
        await loadRandomTopArticles()
        await loadRandomTopMonthArticles()
      }
    )
  )

  try {
    return (
      <div class={styles.Expo}>
        <Show when={props.shouts} fallback={<Loading />} keyed>
          {(feed) => (
            <div class="wide-container">
              <div class="row">
                <For each={Array.from(feed || []).slice(0, SHOUTS_PER_PAGE)}>
                  {(shout) => (
                    <div id={`shout-${shout.id}`} class="col-md-6 mt-md-5 col-sm-8 mt-sm-3">
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

              <Show when={reactedTopMonthArticles()?.length > 0}>
                <ArticleCardSwiper title={t('Top month')} slides={reactedTopMonthArticles()} />
              </Show>

              <Show when={favoriteTopArticles()?.length > 0}>
                <ArticleCardSwiper title={t('Favorite')} slides={favoriteTopArticles()} />
              </Show>
            </div>
          )}
        </Show>
      </div>
    )
  } catch (error) {
    console.error('Error in Expo component:', error)
    return <div>An error occurred. Please try again later.</div>
  }
}

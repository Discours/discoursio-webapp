import { RouteDefinition, RouteSectionProps, createAsync, useLocation } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import { ErrorBoundary, Show, Suspense, createEffect, on, onMount, Switch, Match, createSignal } from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { Loading } from '~/components/_shared/Loading'
import { gaIdentity } from '~/config'
import { useLocalize } from '~/context/localize'
import { getShout } from '~/graphql/api/public'
import type { Author, Reaction, Shout, Topic } from '~/graphql/schema/core.gen'
import { initGA, loadGAScript } from '~/utils/ga'
import { descFromBody, keywordsFromTopics } from '~/utils/meta'
import { FullArticle } from '../../components/Article/FullArticle'
import { PageLayout } from '../../components/_shared/PageLayout'
import { ReactionsProvider } from '../../context/reactions'
import AuthorPage, { AuthorPageProps } from '../author/[slug]/[...tab]'
import TopicPage, { TopicPageProps } from '../topic/[slug]/[...tab]'

const fetchShout = async (slug: string): Promise<Shout | undefined> => {
  if (slug.startsWith('@')) return
  const shoutLoader = getShout({ slug })
  const result = await shoutLoader()
  return result
}

export const route: RouteDefinition = {
  load: async ({ params }) => ({
    article: await fetchShout(params.slug)
  })
}

export type ArticlePageProps = {
  article?: Shout
  comments?: Reaction[]
  votes?: Reaction[]
  author?: Author
}

export type SlugPageProps = {
  article?: Shout
  comments?: Reaction[]
  votes?: Reaction[]
  author?: Author
  topics: Topic[]
}

function ArticlePageContent(props: RouteSectionProps<ArticlePageProps>) {
  const loc = useLocation()
  const { t } = useLocalize()
  const data = createAsync(async () => {
    const result = props.data?.article || (await fetchShout(props.params.slug))
    return result
  })

  onMount(async () => {
    console.debug('[ArticlePage] onMount')
    if (gaIdentity && data()?.id) {
      try {
        await loadGAScript(gaIdentity)
        initGA(gaIdentity)
      } catch (error) {
        console.warn('[routes] [slug]/[...tab] Failed to connect Google Analytics:', error)
      }
    }
  })

  createEffect(
    on(
      data,
      (a?: Shout) => {
        if (!a?.id) return
        window?.gtag?.('event', 'page_view', {
          page_title: a.title,
          page_location: window?.location.href || '',
          page_path: loc.pathname
        })
      },
      { defer: true }
    )
  )

  return (
    <ErrorBoundary fallback={() => <HttpStatusCode code={500} />}>
      <Suspense fallback={<Loading />}>
        <Show
          when={data()?.id}
          fallback={
            <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
              <FourOuFourView />
              <HttpStatusCode code={404} />
            </PageLayout>
          }
        >
          <PageLayout
            title={`${t('Discours')}${data()?.title ? ' :: ' : ''}${data()?.title || ''}`}
            desc={descFromBody(data()?.body || '')}
            keywords={keywordsFromTopics(data()?.topics as { title: string }[])}
            headerTitle={data()?.title || ''}
            slug={data()?.slug}
            cover={data()?.cover || ''}
          >
            <ReactionsProvider>
              <FullArticle article={data() as Shout} />
            </ReactionsProvider>
          </PageLayout>
        </Show>
      </Suspense>
    </ErrorBoundary>
  )
}

export default function ArticlePage(props: RouteSectionProps<SlugPageProps>) {
  console.debug('[routes] [slug]/[...tab] props:', props)

  const { slug } = props.params

  const [currentSlug, setCurrentSlug] = createSignal(props.params.slug);
  createEffect(() => {
    if (props.params.slug !== currentSlug()) {
      setCurrentSlug(props.params.slug);
    }
  });

  return (
    <Switch fallback={<div>Loading...</div>}>
      <Match when={currentSlug().startsWith('@')}>
        <AuthorPage
          {...{
            ...props,
            params: {
              ...props.params,
              slug: slug.slice(1),
            },
          } as RouteSectionProps<AuthorPageProps>}
        />
      </Match>
      <Match when={currentSlug().startsWith('!')}>
        <TopicPage
          {...{
            ...props,
            params: {
              ...props.params,
              slug: slug.slice(1),
            },
          } as RouteSectionProps<TopicPageProps>}
        />
      </Match>
      <Match when={!currentSlug().startsWith('@') && !currentSlug().startsWith('!')}>
        <ArticlePageContent {...props} />
      </Match>
      <Match when={true}>
        <ErrorBoundary fallback={() => <HttpStatusCode code={404} />}>
          <FourOuFourView />
        </ErrorBoundary>
      </Match>
    </Switch>
  )
}
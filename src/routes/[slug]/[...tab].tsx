import { RouteDefinition, RouteSectionProps, useLocation } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import { ErrorBoundary, Show, Suspense, createEffect, on, createSignal, onMount } from 'solid-js'
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

// Simplified fetch function for the shout
const fetchShout = async (slug: string): Promise<Shout | undefined> => {
  console.debug('fetchShout called with slug:', slug)
  if (slug.startsWith('@')) return // Skip fetching article for slugs starting with @ (author pages)
  const result = await getShout({ slug })
  console.debug('fetchShout result:', result)
  return result
}

export const route: RouteDefinition = {
  load: async ({ params }) => {
    const article = await fetchShout(params.slug)
    console.debug('route.load fetched article:', article)
    return { article }
  }
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

export default function ArticlePage(props: RouteSectionProps<SlugPageProps>) {
  // If the slug starts with '@', render as author page
  if (props.params.slug.startsWith('@')) {
    console.debug('[routes] [slug]/[...tab] starts with @, render as author page')
    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug: props.params.slug.slice(1, props.params.slug.length)
      }
    } as RouteSectionProps<AuthorPageProps>
    return <AuthorPage {...patchedProps} />
  }

  // If the slug starts with '!', render as topic page
  if (props.params.slug.startsWith('!')) {
    console.debug('[routes] [slug]/[...tab] starts with !, render as topic page')
    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug: props.params.slug.slice(1, props.params.slug.length)
      }
    } as RouteSectionProps<TopicPageProps>
    return <TopicPage {...patchedProps} />
  }

  // Handle regular article slugs
  function ArticlePage(props: RouteSectionProps<ArticlePageProps>) {
    const loc = useLocation()
    const { t } = useLocalize()

    // Set up a signal for article data and loading state
    const [article, setArticle] = createSignal<Shout | undefined>(props.data?.article)
    const [isLoading, setIsLoading] = createSignal(false)

    // Fetch article data manually based on slug changes
    createEffect(() => {
      const slug = props.params.slug
      if (!slug) return

      setIsLoading(true)
      fetchShout(slug)
        .then((result) => {
          setArticle(result)
          if (!result) {
            console.warn('No article data found for slug:', slug)
          }
        })
        .catch((error) => {
          console.error('Error fetching shout:', error)
        })
        .finally(() => setIsLoading(false))
    })

    // onMount to load GA script
    onMount(async () => {
      console.debug('onMount triggered')
      if (gaIdentity && article()?.id) {
        try {
          console.debug('Loading GA script')
          await loadGAScript(gaIdentity)
          initGA(gaIdentity)
        } catch (error) {
          console.warn('[routes] [slug]/[...tab] Failed to connect Google Analytics:', error)
        }
      }
    })

    // Google Analytics effect
    createEffect(
      on(
        article,
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
            when={!isLoading() && article()?.id}
            fallback={
              <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
                {console.warn('Rendering 404 error page - no article data found')}
                <FourOuFourView />
                <HttpStatusCode code={404} />
              </PageLayout>
            }
          >
            <PageLayout
              title={`${t('Discours')}${article()?.title ? ' :: ' : ''}${article()?.title || ''}`}
              desc={descFromBody(article()?.body || '')}
              keywords={keywordsFromTopics(article()?.topics as { title: string }[])}
              headerTitle={article()?.title || ''}
              slug={article()?.slug}
              cover={article()?.cover || ''}
            >
              <ReactionsProvider>
                <FullArticle article={article() as Shout} />
              </ReactionsProvider>
            </PageLayout>
          </Show>
        </Suspense>
      </ErrorBoundary>
    )
  }

  return <ArticlePage {...props} />
}

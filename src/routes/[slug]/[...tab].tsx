import { RouteDefinition, RouteSectionProps, createAsync, useLocation } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import { ErrorBoundary, Show, Suspense, createEffect, on, onMount } from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { Loading } from '~/components/_shared/Loading'
import { gaIdentity } from '~/config'
import { useLocalize } from '~/context/localize'
import { getShout } from '~/graphql/api/public'
import { useTopics } from '~/context/topics'  // Import Topics context
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

export default function ArticlePage(props: RouteSectionProps<SlugPageProps>) {
  const { topicEntities, loadTopics } = useTopics() // Get topics context
  const slug = props.params.slug

  // Handle author page if slug starts with '@'
  if (slug.startsWith('@')) {
    console.debug('[routes] [slug]/[...tab] starts with @, render as author page')
    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug: slug.slice(1)
      }
    } as RouteSectionProps<AuthorPageProps>
    return <AuthorPage {...patchedProps} />
  }

  // Handle topic page if slug starts with '!'
  if (slug.startsWith('!')) {
    console.debug('[routes] [slug]/[...tab] starts with !, render as topic page')

    const topicSlug = slug.slice(1) // Remove '!' from slug
    const topic = topicEntities()[topicSlug] // Check if the topic is already loaded

    // If the topic is not loaded, fetch topics
    if (!topic) {
      onMount(async () => {
        console.debug('Loading topics for the first time...')
        await loadTopics() // Load topics if not already available
      })

      return <Loading /> // Show a loading state while fetching the topics
    }

    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug: topicSlug
      }
    } as RouteSectionProps<TopicPageProps>
    return <TopicPage {...patchedProps} />
  }

  // Handle topic pages without '!' or '@'
  if (!slug.startsWith('@') && !slug.startsWith('!')) {
    console.debug('[routes] [slug]/[...tab] regular topic page')

    const topic = topicEntities()[slug] // Check if the topic is already loaded

    // If the topic is not loaded, trigger topic loading
    if (!topic) {
      onMount(async () => {
        console.debug('Topic not found, loading topics...')
        await loadTopics()
      })

      return <Loading /> // Show a loading state while fetching the topics
    }

    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug
      }
    } as RouteSectionProps<TopicPageProps>
    return <TopicPage {...patchedProps} />
  }

  // ArticlePage logic for rendering articles if neither `@` nor `!` is in the slug
  function ArticlePage(props: RouteSectionProps<ArticlePageProps>) {
    const loc = useLocation()
    const { t } = useLocalize()
    const data = createAsync(async () => props.data?.article || (await fetchShout(props.params.slug)))

    onMount(async () => {
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

  return <ArticlePage {...props} />
}

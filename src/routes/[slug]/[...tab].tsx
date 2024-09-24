/**
 * [slug].tsx
 * 
 * # Dynamic Slug Route Handler
 * 
 * ## Overview
 * 
 * This file handles dynamic routing based on the `slug` parameter in the URL. Depending on the prefix of the slug, it renders different pages:
 * 
 * - **Author Page**: If the `slug` starts with `@`, it renders the `AuthorPage` component for the specified author.
 * - **Topic Page**: If the `slug` starts with `!`, it renders the `TopicPage` component for the specified topic.
 * - **Article Page**: For all other slugs, it renders the `ArticlePageComponent`, displaying the full article details.
 * 
 * ## Components
 * 
 * - **SlugPage**: The main component that determines which page to render based on the `slug`.
 * - **ArticlePageComponent**: Fetches and displays the detailed view of an article.
 * - **AuthorPage**: Displays author-specific information (imported from `../author/[slug]/[...tab]`).
 * - **TopicPage**: Displays topic-specific information (imported from `../topic/[slug]/[...tab]`).
 * 
 * ## Data Fetching
 * 
 * - **fetchShout**: Asynchronously fetches article data based on the `slug` using the `getShout` GraphQL query.
 * - **createResource**: Utilized in `ArticlePageComponent` to fetch and manage article data reactively.**/


import { RouteDefinition, RouteSectionProps, useLocation, useParams } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import { ErrorBoundary, Show, Suspense, createEffect, on, onMount, createResource } from 'solid-js'
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
  if (slug.startsWith('@') || slug.startsWith('!')) return
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

export default function SlugPage(props: RouteSectionProps<SlugPageProps>) {
  const { t } = useLocalize()
  const loc = useLocation()

  const params = useParams()
  const slug = createMemo(() => params.slug)

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

  if (slug.startsWith('!')) {
    console.debug('[routes] [slug]/[...tab] starts with !, render as topic page')
    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug: slug.slice(1)
      }
    } as RouteSectionProps<TopicPageProps>
    return <TopicPage {...patchedProps} />
  }

  // Pass slug as a prop to ArticlePageComponent
  return <ArticlePageComponent slug={slug()} {...props} />
}

function ArticlePageComponent(props: RouteSectionProps<SlugPageProps> & { slug: string }) {
  const loc = useLocation()
  const { t } = useLocalize()
  const { slug } = props

  // Define the fetcher function
  const fetchArticle = async (slug: string): Promise<Shout | undefined> => {
    return await fetchShout(slug)
  }

  // Create a resource that fetches the article based on slug
  const [article, { refetch, mutate }] = createResource(slug, fetchArticle)

  // Handle Google Analytics
  createEffect(() => {
    const currentArticle = article()
    if (gaIdentity && currentArticle?.id) {
      loadGAScript(gaIdentity)
        .then(() => initGA(gaIdentity))
        .catch((error) => {
          console.warn('[routes] [slug]/[...tab] Failed to connect Google Analytics:', error)
        })
    }
  })

  createEffect(() => {
    const currentArticle = article()
    if (currentArticle?.id) {
      window?.gtag?.('event', 'page_view', {
        page_title: currentArticle.title,
        page_location: window?.location.href || '',
        page_path: loc.pathname
      })
    }
  })

  return (
    <ErrorBoundary fallback={() => <HttpStatusCode code={500} />}>
      <Suspense fallback={<Loading />}>
        <Show
          when={article()}
          fallback={
            <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
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

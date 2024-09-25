import { RouteDefinition, RouteSectionProps, createAsync, useLocation } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import { ErrorBoundary, Show, Suspense, onMount } from 'solid-js'
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
  console.debug('fetchShout called with slug:', slug)
  if (slug.startsWith('@')) return
  const shoutLoader = getShout({ slug })
  const result = await shoutLoader()
  console.debug('fetchShout result:', result)
  return result
}

export const route: RouteDefinition = {
  load: async ({ params }) => {
    console.debug('route.load called with params:', params)
    const article = await fetchShout(params.slug)
    console.debug('route.load fetched article:', article)
    if (!article) {
      console.warn('No article fetched for the given slug:', params.slug);
    }
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

  function ArticlePage(props: RouteSectionProps<ArticlePageProps>) {
    const loc = useLocation()
    const { t } = useLocalize()
    const data = createAsync(async () => {
      console.debug('createAsync fetching data with slug:', props.params.slug)
      const result = props.data?.article || (await fetchShout(props.params.slug))
      console.debug('createAsync fetched result:', result)
      return result
    })

    onMount(async () => {
      console.debug('onMount triggered')
      if (gaIdentity && data()?.id) {
        try {
          console.debug('Loading GA script')
          await loadGAScript(gaIdentity)
          initGA(gaIdentity)
        } catch (error) {
          console.warn('[routes] [slug]/[...tab] Failed to connect Google Analytics:', error)
        }
      }
    })

    return (
      <ErrorBoundary fallback={() => {
        console.error('Rendering 500 error page')
        return <HttpStatusCode code={500} />
      }}>
        <Suspense fallback={<Loading />}>
          <Show
            when={data()?.id}
            fallback={
              <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
                {console.warn('Rendering 404 error page - no article data found')}
                <FourOuFourView />
                <HttpStatusCode code={404} />
              </PageLayout>
            }
          >
            {console.debug('Rendering article page with data:', data())}
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

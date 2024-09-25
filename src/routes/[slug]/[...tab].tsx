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
 * - **InnerArticlePage**: Fetches and displays the detailed view of an article.
 * - **AuthorPage**: Displays author-specific information (imported from `../author/[slug]/[...tab]`).
 * - **TopicPage**: Displays topic-specific information (imported from `../topic/[slug]/[...tab]`).
 **/

import { RouteDefinition, RouteSectionProps, createAsync, useLocation, useParams } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import { ErrorBoundary, Show, Suspense, createEffect, on, onMount } from 'solid-js'
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

export default function ArticlePage(props: RouteSectionProps<SlugPageProps>) {
  const params = useParams();

  if (params.slug.startsWith('@')) {
    console.debug('[routes] [slug]/[...tab] starts with @, render as author page')
    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug: params.slug.slice(1, params.slug.length)
      }
    } as RouteSectionProps<AuthorPageProps>
    return <AuthorPage {...patchedProps} />
  }

  if (params.slug.startsWith('!')) {
    console.debug('[routes] [slug]/[...tab] starts with !, render as topic page')
    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug: params.slug.slice(1, params.slug.length)
      }
    } as RouteSectionProps<TopicPageProps>
    return <TopicPage {...patchedProps} />
  }

  return <InnerArticlePage {...props} />
}

function InnerArticlePage(props: RouteSectionProps<ArticlePageProps>) {
  const loc = useLocation();
  const { t } = useLocalize();
  const params = useParams();

  console.debug('Initial slug from useParams:', params.slug);

  const data = createAsync(async () => {
    console.debug('Fetching article with slug (createAsync):', params.slug);
    const result = props.data?.article || (await fetchShout(params.slug));
    console.debug('Fetched article data (createAsync):', result);
    return result;
  });

  onMount(async () => {
    console.debug('onMount triggered');
    if (gaIdentity && data()?.id) {
      try {
        console.debug('Loading GA script');
        await loadGAScript(gaIdentity);
        initGA(gaIdentity);
      } catch (error) {
        console.warn('[routes] [slug]/[...tab] Failed to connect Google Analytics:', error);
      }
    }
  });

  createEffect(
    on(
      () => params.slug,
      async (newSlug) => {
        console.debug('Slug changed (useParams):', newSlug);
        const result = await fetchShout(newSlug);
        console.debug('Fetched article data (useParams):', result);
        data(result);
      }
    )
  );

  createEffect(
    on(
      data,
      (a?: Shout) => {
        if (!a?.id) return;
        console.debug('Page view event for article:', a);
        window?.gtag?.('event', 'page_view', {
          page_title: a.title,
          page_location: window?.location.href || '',
          page_path: loc.pathname
        });
      },
      { defer: true }
    )
  );

  createEffect(async () => {
    console.debug('Data from createAsync effect:', data());
  });

  return (
    <ErrorBoundary fallback={() => {
      console.error('Rendering 500 error page');
      return <HttpStatusCode code={500} />;
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
  );
}

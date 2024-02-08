import type { PageProps, RootSearchParams } from '../utils/types'

import { Meta, MetaProvider } from '@solidjs/meta'
import { Component, createEffect, createMemo } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { ConfirmProvider } from '../context/confirm'
import { ConnectProvider } from '../context/connect'
import { EditorProvider } from '../context/editor'
import { FollowingProvider } from '../context/following'
import { InboxProvider } from '../context/inbox'
import { LocalizeProvider } from '../context/localize'
import { MediaQueryProvider } from '../context/mediaQuery'
import { NotificationsProvider } from '../context/notifications'
import { SessionProvider } from '../context/session'
import { SnackbarProvider } from '../context/snackbar'
import { FourOuFourPage } from '../pages/404/+Page'
import { DiscussionRulesPage } from '../pages/about/discussion-rules/+Page'
import { DogmaPage } from '../pages/about/dogma/+Page'
import { GuidePage } from '../pages/about/guide/+Page'
import { HelpPage } from '../pages/about/help/+Page'
import { ManifestPage } from '../pages/about/manifest/+Page'
import { PartnersPage } from '../pages/about/partners/+Page'
import { PrinciplesPage } from '../pages/about/principles/+Page'
import { ProjectsPage } from '../pages/about/projects/+Page'
import { TermsOfUsePage } from '../pages/about/terms-of-use/+Page'
import { ThanksPage } from '../pages/about/thanks/+Page'
import { ArticlePage } from '../pages/article/+Page'
import { AuthorPage } from '../pages/author/+Page'
import { AllAuthorsPage } from '../pages/authors/+Page'
import { ConnectPage } from '../pages/connect/+Page'
import { CreatePage } from '../pages/create/+Page'
import { DraftsPage } from '../pages/drafts/+Page'
import { EditPage } from '../pages/edit/+Page'
import { ExpoPage } from '../pages/expo/+Page'
import { FeedPage } from '../pages/feed/+Page'
import { InboxPage } from '../pages/inbox/+Page'
import { Page as HomePage } from '../pages/index/+Page'
import { ProfileSecurityPage } from '../pages/profile/security/+Page'
import { ProfileSettingsPage } from '../pages/profile/settings/+Page'
import { ProfileSubscriptionsPage } from '../pages/profile/subscriptions/+Page'
import { SearchPage } from '../pages/search/+Page'
import { TopicPage } from '../pages/topic/+Page'
import { AllTopicsPage } from '../pages/topics/+Page'
import { ROUTES, useRouter } from '../stores/router'
import { MODALS, hideModal, showModal } from '../stores/ui'

// TODO: lazy load
// const SomePage = lazy(() => import('./Pages/SomePage'))

const pagesMap: Record<keyof typeof ROUTES, Component<PageProps>> = {
  author: AuthorPage,
  authorComments: AuthorPage,
  authorAbout: AuthorPage,
  inbox: InboxPage,
  expo: ExpoPage,
  connect: ConnectPage,
  create: CreatePage,
  edit: EditPage,
  editSettings: EditPage,
  drafts: DraftsPage,
  home: HomePage,
  topics: AllTopicsPage,
  topic: TopicPage,
  authors: AllAuthorsPage,
  feed: FeedPage,
  feedMy: FeedPage,
  feedNotifications: FeedPage,
  feedBookmarks: FeedPage,
  feedCollaborations: FeedPage,
  feedDiscussions: FeedPage,
  article: ArticlePage,
  search: SearchPage,
  discussionRules: DiscussionRulesPage,
  dogma: DogmaPage,
  guide: GuidePage,
  help: HelpPage,
  manifest: ManifestPage,
  projects: ProjectsPage,
  partners: PartnersPage,
  principles: PrinciplesPage,
  termsOfUse: TermsOfUsePage,
  thanks: ThanksPage,
  profileSettings: ProfileSettingsPage,
  profileSecurity: ProfileSecurityPage,
  profileSubscriptions: ProfileSubscriptionsPage,
  fourOuFour: FourOuFourPage
}

type Props = PageProps & { is404: boolean }

export const App = (props: Props) => {
  const { page, searchParams } = useRouter<RootSearchParams>()
  const is404 = createMemo(() => props.is404)

  createEffect(() => {
    if (!searchParams().m) {
      hideModal()
    }

    const modal = MODALS[searchParams().m]
    if (modal) {
      showModal(modal)
    }
  })

  const pageComponent = createMemo(() => {
    const result = pagesMap[page()?.route || 'home']

    if (is404() || !result || page()?.path === '/404') {
      return FourOuFourPage
    }

    return result
  })

  return (
    <MetaProvider>
      <Meta name="viewport" content="width=device-width, initial-scale=1" />
      <LocalizeProvider>
        <MediaQueryProvider>
          <SnackbarProvider>
            <ConfirmProvider>
              <SessionProvider onStateChangeCallback={console.log}>
                <FollowingProvider>
                  <ConnectProvider>
                    <NotificationsProvider>
                      <EditorProvider>
                        <InboxProvider>
                          <Dynamic component={pageComponent()} {...props} />
                        </InboxProvider>
                      </EditorProvider>
                    </NotificationsProvider>
                  </ConnectProvider>
                </FollowingProvider>
              </SessionProvider>
            </ConfirmProvider>
          </SnackbarProvider>
        </MediaQueryProvider>
      </LocalizeProvider>
    </MetaProvider>
  )
}

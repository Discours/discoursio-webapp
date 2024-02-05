import type { PageProps, RootSearchParams } from '../pages/types'

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
import { DiscussionRulesPage } from '../pages/about/discussionRules.page'
import { DogmaPage } from '../pages/about/dogma.page'
import { GuidePage } from '../pages/about/guide.page'
import { HelpPage } from '../pages/about/help.page'
import { ManifestPage } from '../pages/about/manifest.page'
import { PartnersPage } from '../pages/about/partners.page'
import { PrinciplesPage } from '../pages/about/principles.page'
import { ProjectsPage } from '../pages/about/projects.page'
import { TermsOfUsePage } from '../pages/about/termsOfUse.page'
import { ThanksPage } from '../pages/about/thanks.page'
import { AllAuthorsPage } from '../pages/allAuthors.page'
import { AllTopicsPage } from '../pages/allTopics.page'
import { ArticlePage } from '../pages/article.page'
import { AuthorPage } from '../pages/author.page'
import { ConnectPage } from '../pages/connect.page'
import { CreatePage } from '../pages/create.page'
import { DraftsPage } from '../pages/drafts.page'
import { EditPage } from '../pages/edit.page'
import { ExpoPage } from '../pages/expo/expo.page'
import { FeedPage } from '../pages/feed.page'
import { FourOuFourPage } from '../pages/fourOuFour.page'
import { InboxPage } from '../pages/inbox.page'
import { HomePage } from '../pages/index.page'
import { ProfileSecurityPage } from '../pages/profile/profileSecurity.page'
import { ProfileSettingsPage } from '../pages/profile/profileSettings.page'
import { ProfileSubscriptionsPage } from '../pages/profile/profileSubscriptions.page'
import { SearchPage } from '../pages/search.page'
import { TopicPage } from '../pages/topic.page'
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
  fourOuFour: FourOuFourPage,
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

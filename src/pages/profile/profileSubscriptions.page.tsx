import { PageLayout } from '../../components/_shared/PageLayout'
import { AuthGuard } from '../../components/AuthGuard'
import { ProfileSubscriptions } from '../../components/Views/ProfileSubscriptions'
import { PageProps } from '../types'

export const ProfileSubscriptionsPage = (props: PageProps) => {
  return (
    <PageLayout title={props.seo.title}>
      <AuthGuard>
        <ProfileSubscriptions />
      </AuthGuard>
    </PageLayout>
  )
}

export const Page = ProfileSubscriptionsPage

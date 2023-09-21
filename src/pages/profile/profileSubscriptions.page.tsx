import { PageLayout } from '../../components/_shared/PageLayout'
import { AuthGuard } from '../../components/AuthGuard'
import { ProfileSubscriptions } from '../../components/Views/ProfileSubscriptions'

export const ProfileSubscriptionsPage = () => {
  return (
    <PageLayout>
      <AuthGuard>
        <ProfileSubscriptions />
      </AuthGuard>
    </PageLayout>
  )
}

export const Page = ProfileSubscriptionsPage

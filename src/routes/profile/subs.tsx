import { AuthGuard } from '../../components/AuthGuard'
import { ProfileSubscriptions } from '../../components/Views/ProfileSubscriptions'
import { PageLayout } from '../../components/_shared/PageLayout'
import { useLocalize } from '../../context/localize'

export const ProfileSubscriptionsPage = () => {
  const { t } = useLocalize()

  return (
    <PageLayout title={t('Profile')}>
      <AuthGuard>
        <ProfileSubscriptions />
      </AuthGuard>
    </PageLayout>
  )
}

export default ProfileSubscriptionsPage

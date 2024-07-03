import { ProfileProvider } from '~/context/profile'
import { AuthGuard } from '../../components/AuthGuard'
import { ProfileSettings } from '../../components/ProfileSettings'
import { PageLayout } from '../../components/_shared/PageLayout'
import { useLocalize } from '../../context/localize'

export const ProfileSettingsPage = () => {
  const { t } = useLocalize()

  return (
    <PageLayout title={t('Profile')}>
      <AuthGuard>
        <ProfileProvider>
          <ProfileSettings />
        </ProfileProvider>
      </AuthGuard>
    </PageLayout>
  )
}

export default ProfileSettingsPage

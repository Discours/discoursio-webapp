import { useLocalize } from '../../../context/localize'
import { Modal } from '../../Nav/Modal'
import { UserSearch } from '../UserSearch'

export const InviteCoAuthorsModal = () => {
  const { t } = useLocalize()

  return (
    <Modal variant="medium" name="inviteCoAuthors">
      <h2>{t('Invite collaborators')}</h2>
      <div style={{ 'min-height': '400px' }}>
        <UserSearch placeholder={t('Write your colleagues name or email')} onChange={() => ''} />
      </div>
    </Modal>
  )
}

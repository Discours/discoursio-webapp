import { useLocalize } from '../../../context/localize'
import { Modal } from '../../Nav/Modal'
import { UserSearch } from '../UserSearch'

type Props = {
  title?: string
}
export const InviteCoAuthorsModal = (props: Props) => {
  const { t } = useLocalize()

  return (
    <Modal variant="medium" name="inviteCoAuthors">
      <h2>{props.title || t('Invite collaborators')}</h2>
      <UserSearch placeholder={t('Write your colleagues name or email')} onChange={() => {}} />
    </Modal>
  )
}

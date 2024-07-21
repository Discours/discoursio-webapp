import { useLocalize } from '~/context/localize'
import { useUI } from '~/context/ui'
import { Modal } from '../Modal'
import { ShareLinks } from '../ShareLinks'

type Props = {
  modalTitle?: string
  shareUrl?: string
  title: string
  imageUrl: string
  description: string
}
export const ShareModal = (props: Props) => {
  const { t } = useLocalize()
  const { hideModal } = useUI()
  return (
    <Modal name="share" variant="medium">
      <h2>{t('Share publication')}</h2>
      <ShareLinks
        variant="inModal"
        title={props.title}
        shareUrl={props.shareUrl || ''}
        imageUrl={props.imageUrl}
        description={props.description}
        onShareClick={() => hideModal()}
      />
    </Modal>
  )
}

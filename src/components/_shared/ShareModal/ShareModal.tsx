import { useLocalize } from '../../../context/localize'
import { Modal } from '../../Nav/Modal'
import { Button } from '../Button'
import { ShareLinks } from '../ShareLinks'

import styles from '../ShareLinks/ShareLinks.module.scss'

type Props = {
  modalTitle?: string
  shareUrl?: string
  title: string
  imageUrl: string
  description: string
}
export const ShareModal = (props: Props) => {
  const { t } = useLocalize()

  return (
    <Modal name="share" variant="medium" allowClose={true}>
      <h2>{t('Share publication')}</h2>
      <ShareLinks
        variant="inModal"
        title={props.title}
        shareUrl={props.shareUrl}
        imageUrl={props.imageUrl}
        description={props.description}
      />
    </Modal>
  )
}

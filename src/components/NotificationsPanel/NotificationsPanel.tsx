import { clsx } from 'clsx'
import styles from './NotificationsPanel.module.scss'
import { useEscKeyDownHandler } from '../../utils/useEscKeyDownHandler'
import { useOutsideClickHandler } from '../../utils/useOutsideClickHandler'
import { useLocalize } from '../../context/localize'
import { Icon } from '../_shared/Icon'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const NotificationsPanel = (props: Props) => {
  const { t } = useLocalize()
  const handleHide = () => {
    props.onClose()
  }

  const panelRef: { current: HTMLDivElement } = {
    current: null
  }

  useOutsideClickHandler({
    containerRef: panelRef,
    predicate: () => props.isOpen,
    handler: () => handleHide()
  })

  useEscKeyDownHandler(handleHide)
  return (
    <div
      class={clsx(styles.container, {
        [styles.isOpened]: props.isOpen
      })}
    >
      <div ref={(el) => (panelRef.current = el)} class={styles.panel}>
        <div class={styles.closeButton} onClick={handleHide}>
          {/*TODO: check markup (hover)*/}
          <Icon name="close" />
        </div>
        <div class={styles.title}>{t('Notifications')}</div>
      </div>
    </div>
  )
}

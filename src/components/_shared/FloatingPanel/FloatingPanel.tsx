import { clsx } from 'clsx'

import { Button } from '../Button'

import styles from './FloatingPanel.module.scss'

type Props = {
  isVisible: boolean
  confirmTitle: string
  confirmAction: () => void
  declineTitle: string
  declineAction: (e: any) => void
}

export default (props: Props) => {
  return (
    <div
      class={clsx(styles.PanelWrapper, {
        [styles.PanelWrapperVisible]: props.isVisible
      })}
    >
      <Button
        type="button"
        size="L"
        variant="bordered"
        value={props.declineTitle}
        onClick={(e) => props.declineAction(e)}
      />

      <Button type="submit" size="L" value={props.confirmTitle} onClick={props.confirmAction} />
    </div>
  )
}

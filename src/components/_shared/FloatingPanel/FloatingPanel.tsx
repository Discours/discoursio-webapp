import { clsx } from 'clsx'

import { Button } from '../Button'

import styles from './FloatingPanel.module.scss'

type Props = {
  isVisible: boolean
  confirmTitle: string
  confirmAction: () => void
  declineTitle: string
  declineAction: () => void
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
        onClick={() => {
          props.declineAction()
        }}
      />

      <Button type="submit" size="L" value={props.confirmTitle} onClick={props.confirmAction} />
    </div>
  )
}

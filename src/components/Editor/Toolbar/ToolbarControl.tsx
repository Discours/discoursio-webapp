import { Editor } from '@tiptap/core'
import clsx from 'clsx'
import { JSX } from 'solid-js'
import { Popover } from '~/components/_shared/Popover'

import styles from '../MiniEditor/MiniEditor.module.scss'

interface ControlProps {
  editor: Editor | undefined
  title: string
  key: string
  onChange: () => void
  isActive?: (editor: Editor) => boolean
  children: JSX.Element
}

export const ToolbarControl = (props: ControlProps): JSX.Element => {
  const handleClick = (ev?: MouseEvent) => {
    ev?.preventDefault()
    ev?.stopPropagation()
    props.onChange?.()
  }

  return (
    <Popover content={props.title}>
      {(triggerRef: (el: HTMLElement) => void) => (
        <button
          ref={triggerRef}
          type="button"
          class={clsx(styles.actionButton, { [styles.active]: props.editor?.isActive?.(props.key) })}
          onClick={handleClick}
        >
          {props.children}
        </button>
      )}
    </Popover>
  )
}

export default ToolbarControl

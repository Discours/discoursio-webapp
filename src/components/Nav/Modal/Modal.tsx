import { createEffect, createSignal, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { hideModal, useModalStore } from '../../../stores/ui'
import { useEscKeyDownHandler } from '../../../utils/useEscKeyDownHandler'
import { clsx } from 'clsx'
import styles from './Modal.module.scss'

interface ModalProps {
  name: string
  variant: 'narrow' | 'wide'
  children: JSX.Element
  onClose?: () => void
}

export const Modal = (props: ModalProps) => {
  const { modal } = useModalStore()

  const handleHide = () => {
    if (modal()) {
      hideModal()
      props.onClose && props.onClose()
    }
  }

  useEscKeyDownHandler(handleHide)

  const [visible, setVisible] = createSignal(false)

  createEffect(() => {
    setVisible(modal() === props.name)
  })

  return (
    <Show when={visible()}>
      <div class={styles.backdrop} onClick={handleHide}>
        <div
          class={clsx(styles.modal, {
            [styles.narrow]: props.variant === 'narrow'
          })}
          onClick={(event) => event.stopPropagation()}
        >
          {props.children}
          <div class={styles.close} onClick={handleHide}>
            <svg width="16" height="18" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.99987 7.52552L14.1871 0.92334L15.9548 2.80968L9.76764 9.41185L15.9548 16.014L14.1871 17.9004L7.99987 11.2982L1.81269 17.9004L0.0449219 16.014L6.23211 9.41185L0.0449225 2.80968L1.81269 0.92334L7.99987 7.52552Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </Show>
  )
}

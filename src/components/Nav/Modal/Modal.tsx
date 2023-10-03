import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { clsx } from 'clsx'
import { hideModal, useModalStore } from '../../../stores/ui'
import { useEscKeyDownHandler } from '../../../utils/useEscKeyDownHandler'

import styles from './Modal.module.scss'
import { redirectPage } from '@nanostores/router'
import { router } from '../../../stores/router'

interface Props {
  name: string
  variant: 'narrow' | 'wide' | 'medium'
  children: JSX.Element
  onClose?: () => void
  noPadding?: boolean
  maxHeight?: boolean
  allowClose?: boolean
}

export const Modal = (props: Props) => {
  const { modal } = useModalStore()
  const [visible, setVisible] = createSignal(false)
  const allowClose = createMemo(() => props.allowClose !== false)
  const handleHide = () => {
    if (modal()) {
      if (allowClose()) {
        props.onClose && props.onClose()
      } else {
        redirectPage(router, 'home')
      }
    }

    hideModal()
  }

  useEscKeyDownHandler(handleHide)

  createEffect(() => {
    setVisible(modal() === props.name)
  })

  return (
    <Show when={visible()}>
      <div class={styles.backdrop} onClick={handleHide}>
        <div class="wide-container">
          <div
            class={clsx(styles.modal, {
              [styles.narrow]: props.variant === 'narrow',
              ['col-auto col-md-20 offset-md-2 col-lg-14 offset-lg-5']: props.variant === 'medium',
              [styles.noPadding]: props.noPadding,
              [styles.maxHeight]: props.maxHeight
            })}
            onClick={(event) => event.stopPropagation()}
          >
            <div class={styles.modalInner}>{props.children}</div>
            <div class={styles.close} onClick={handleHide}>
              <svg
                class={styles.icon}
                width="16"
                height="18"
                viewBox="0 0 16 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.99987 7.52552L14.1871 0.92334L15.9548 2.80968L9.76764 9.41185L15.9548 16.014L14.1871 17.9004L7.99987 11.2982L1.81269 17.9004L0.0449219 16.014L6.23211 9.41185L0.0449225 2.80968L1.81269 0.92334L7.99987 7.52552Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}

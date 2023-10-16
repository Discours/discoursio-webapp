import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { clsx } from 'clsx'
import { hideModal, useModalStore } from '../../../stores/ui'
import { useEscKeyDownHandler } from '../../../utils/useEscKeyDownHandler'

import styles from './Modal.module.scss'
import { redirectPage } from '@nanostores/router'
import { router } from '../../../stores/router'
import { Icon } from '../../_shared/Icon'

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
              <Icon name="close" class={styles.icon} />
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}

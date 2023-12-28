import type { JSX } from 'solid-js'

import { redirectPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'

import { useMediaQuery } from '../../../context/mediaQuery'
import { router } from '../../../stores/router'
import { hideModal, useModalStore } from '../../../stores/ui'
import { useEscKeyDownHandler } from '../../../utils/useEscKeyDownHandler'
import { Icon } from '../../_shared/Icon'

import styles from './Modal.module.scss'

interface Props {
  name: string
  variant: 'narrow' | 'wide' | 'medium'
  children: JSX.Element
  onClose?: () => void
  noPadding?: boolean
  maxHeight?: boolean
  allowClose?: boolean
  isResponsive?: boolean
}

export const Modal = (props: Props) => {
  const { modal } = useModalStore()
  const [visible, setVisible] = createSignal(false)
  const allowClose = createMemo(() => props.allowClose !== false)
  const [isMobileView, setIsMobileView] = createSignal(false)
  const { mediaMatches } = useMediaQuery()
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

  createEffect(() => {
    if (props.isResponsive) {
      setIsMobileView(!mediaMatches.sm)
    }
  })

  return (
    <Show when={visible()}>
      <div class={clsx(styles.backdrop, { [styles.isMobile]: isMobileView() })} onClick={handleHide}>
        <div class={clsx('wide-container', styles.container)}>
          <div
            class={clsx(styles.modal, {
              [styles.narrow]: props.variant === 'narrow',
              ['col-auto col-md-20 offset-md-2 col-lg-14 offset-lg-5']: props.variant === 'medium',
              [styles.noPadding]: props.noPadding,
              [styles.maxHeight]: props.maxHeight,
            })}
            onClick={(event) => event.stopPropagation()}
          >
            <div class={styles.modalInner}>{props.children}</div>
            <Show when={!isMobileView()}>
              <div class={styles.close} onClick={handleHide}>
                <Icon name="close" class={styles.icon} />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}

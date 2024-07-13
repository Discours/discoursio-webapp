import { redirect } from '@solidjs/router'
import { clsx } from 'clsx'
import type { JSX } from 'solid-js'
import { Show } from 'solid-js'
import { Icon } from '~/components/_shared/Icon'
import { useUI } from '~/context/ui'
import { isPortrait } from '~/lib/mediaQuery'
import { useEscKeyDownHandler } from '~/lib/useEscKeyDownHandler'
import styles from './Modal.module.scss'

interface Props {
  name: string
  variant: 'narrow' | 'wide' | 'medium'
  children: JSX.Element
  onClose?: () => void
  noPadding?: boolean
  maxHeight?: boolean
  hideClose?: boolean
  isResponsive?: boolean
}

export const Modal = (props: Props) => {
  const { modal, hideModal } = useUI()

  const handleHide = () => {
    console.debug('[Modal.handleHide]', modal())
    if (modal()) {
      if (props.hideClose) redirect('/')
      props.onClose?.()
      hideModal()
    }
  }

  useEscKeyDownHandler(handleHide)
  return (
    <Show when={modal() === props.name}>
      <div
        class={clsx(styles.backdrop, [styles[`modal-${props.name}` as keyof typeof styles]], {
          [styles.isMobile]: props.isResponsive && isPortrait()
        })}
        onClick={handleHide}
      >
        <div class={clsx('wide-container', styles.container)}>
          <div
            class={clsx(styles.modal, {
              [styles.narrow]: props.variant === 'narrow',
              'col-auto col-md-20 offset-md-2 col-lg-14 offset-lg-5': props.variant === 'medium',
              [styles.noPadding]: props.noPadding,
              [styles.maxHeight]: props.maxHeight
            })}
            onClick={(event) => event.stopPropagation()}
          >
            <div class={styles.modalInner}>{props.children}</div>
            <Show when={!isPortrait()}>
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

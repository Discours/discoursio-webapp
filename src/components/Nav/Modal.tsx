import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { getLogger } from '../../utils/logger'
import './Modal.scss'
import { hideModal, useModalStore } from '../../stores/ui'
import { useEscKeyDownHandler } from '../../utils/useEscKeyDownHandler'

const log = getLogger('modal')

interface ModalProps {
  name: string
  children: JSX.Element
}

export const Modal = (props: ModalProps) => {
  const { modal } = useModalStore()

  const wrapClick = (event: { target: Element }) => {
    if (event.target.classList.contains('modalwrap')) hideModal()
  }

  useEscKeyDownHandler(() => hideModal())

  const [visible, setVisible] = createSignal(false)

  createEffect(() => {
    setVisible(modal() === props.name)
    log.debug(`${props.name} is ${modal() === props.name ? 'visible' : 'hidden'}`)
  })

  return (
    <Show when={visible()}>
      <div class="modalwrap" onClick={wrapClick}>
        <div class="modalwrap__inner">
          {props.children}
          <div class="close-control" onClick={hideModal}>
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

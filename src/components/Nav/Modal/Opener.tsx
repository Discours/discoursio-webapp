import type { JSX } from 'solid-js/jsx-runtime'
import type { ModalType } from '../../../stores/ui'

import { showModal } from '../../../stores/ui'

export default (props: { name: ModalType; children: JSX.Element }) => {
  return (
    <a href="#" onClick={() => showModal(props.name)}>
      {props.children}
    </a>
  )
}

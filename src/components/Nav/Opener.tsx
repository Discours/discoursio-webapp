import type { ModalType } from '../../stores/ui'
import { showModal } from '../../stores/ui'

export default (props: { name: ModalType; children: any }) => {
  return (
    <a href="#" onClick={() => showModal(props.name)}>
      {props.children}
    </a>
  )
}

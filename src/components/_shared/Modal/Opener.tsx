import type { JSX } from 'solid-js/jsx-runtime'
import { type ModalType, useUI } from '~/context/ui'

export const Opener = (props: { name: ModalType; children: JSX.Element }) => {
  const { showModal } = useUI()
  return (
    <a href="#" onClick={() => showModal(props.name)}>
      {props.children}
    </a>
  )
}

export default Opener

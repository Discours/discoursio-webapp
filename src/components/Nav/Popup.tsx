import { createEffect, createSignal, onMount, Show } from 'solid-js'
import style from './Popup.module.scss'
import { hideModal, useModalStore } from '../../stores/ui'
import {clsx} from 'clsx';

interface PopupProps {
  name: string
  children: any
  class?: string
}

export const Popup = (props: PopupProps) => {
  const { getModal } = useModalStore()

  onMount(() => {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideModal()
    })
  })

  const [visible, setVisible] = createSignal(false)
  createEffect(() => {
    setVisible(getModal() === props.name)
  })

  return (
    <Show when={visible()}>
      <div class={clsx(style.popup, props.class)}>
        {props.children}
      </div>
    </Show>
  )
}

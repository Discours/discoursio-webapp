import type { Accessor, JSX } from 'solid-js'

import { createContext, createSignal, useContext } from 'solid-js'

import { ButtonVariant } from '../components/_shared/Button/Button'
import { hideModal, showModal } from '../stores/ui'

type ConfirmMessage = {
  confirmBody?: string | JSX.Element
  confirmButtonLabel?: string
  confirmButtonVariant?: ButtonVariant
  declineButtonLabel?: string
  declineButtonVariant?: ButtonVariant
}

type ConfirmContextType = {
  confirmMessage: Accessor<ConfirmMessage>
  showConfirm: (message?: {
    confirmBody?: ConfirmMessage['confirmBody']
    confirmButtonLabel?: ConfirmMessage['confirmButtonLabel']
    confirmButtonVariant?: ConfirmMessage['confirmButtonVariant']
    declineButtonLabel?: ConfirmMessage['declineButtonLabel']
    declineButtonVariant?: ConfirmMessage['declineButtonVariant']
  }) => Promise<boolean>
  resolveConfirm: (value: boolean) => void
}

const ConfirmContext = createContext<ConfirmContextType>()

export function useConfirm() {
  return useContext(ConfirmContext)
}

export const ConfirmProvider = (props: { children: JSX.Element }) => {
  const [confirmMessage, setConfirmMessage] = createSignal<ConfirmMessage>(null)

  let resolveFn: (value: boolean) => void

  const showConfirm = (
    message: {
      confirmBody?: ConfirmMessage['confirmBody']
      confirmButtonLabel?: ConfirmMessage['confirmButtonLabel']
      confirmButtonVariant?: ConfirmMessage['confirmButtonVariant']
      declineButtonLabel?: ConfirmMessage['declineButtonLabel']
      declineButtonVariant?: ConfirmMessage['declineButtonVariant']
    } = {}
  ): Promise<boolean> => {
    const messageToShow = {
      confirmBody: message.confirmBody,
      confirmButtonLabel: message.confirmButtonLabel,
      confirmButtonVariant: message.confirmButtonVariant,
      declineButtonLabel: message.declineButtonLabel,
      declineButtonVariant: message.declineButtonVariant
    }

    setConfirmMessage(messageToShow)
    showModal('confirm')

    return new Promise((resolve) => {
      resolveFn = resolve
    })
  }

  const resolveConfirm = (value: boolean) => {
    resolveFn(value)
    hideModal()
  }

  const actions = {
    showConfirm,
    resolveConfirm
  }

  const value: ConfirmContextType = { confirmMessage, ...actions }

  return <ConfirmContext.Provider value={value}>{props.children}</ConfirmContext.Provider>
}

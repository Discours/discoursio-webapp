import { createContext, createSignal, useContext } from 'solid-js'
import type { Accessor, JSX } from 'solid-js'

import { hideModal, showModal } from '../stores/ui'

type ConfirmMessage = {
  confirmBody?: string | JSX.Element
  confirmButtonLabel?: string
  declineButtonLabel?: string
}

type ConfirmContextType = {
  confirmMessage: Accessor<ConfirmMessage>
  actions: {
    showConfirm: (message?: {
      confirmBody?: ConfirmMessage['confirmBody']
      confirmButtonLabel?: ConfirmMessage['confirmButtonLabel']
      declineButtonLabel?: ConfirmMessage['declineButtonLabel']
    }) => Promise<boolean>
  }
}

// @@TODO handle res/rej
// @@TODO add t's

const ConfirmContext = createContext<ConfirmContextType>()

export function useConfirm() {
  return useContext(ConfirmContext)
}

export const ConfirmProvider = (props: { children: JSX.Element }) => {
  const [confirmMessage, setConfirmMessage] = createSignal<ConfirmMessage>(null)

  const showConfirm = async (message?: {
    confirmBody: ConfirmMessage['confirmBody']
    confirmButtonLabel: ConfirmMessage['confirmButtonLabel']
    declineButtonLabel: ConfirmMessage['declineButtonLabel']
  }): Promise<boolean> => {
    const messageToShow = {
      confirmBody: message?.confirmBody ?? 'Are you sure you want to to proceed the action?',
      confirmButtonLabel: message?.confirmButtonLabel ?? 'Confirm',
      declineButtonLabel: message?.declineButtonLabel ?? 'Decline'
    }

    setConfirmMessage(messageToShow)
    showModal('confirm')

    return new Promise((res, rej) => ({ res, rej }))
  }

  const actions = {
    showConfirm
  }

  const value: ConfirmContextType = { confirmMessage, actions }

  return <ConfirmContext.Provider value={value}>{props.children}</ConfirmContext.Provider>
}

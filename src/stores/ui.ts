import { createSignal } from 'solid-js'
import { useRouter } from './router'

export const [locale, setLocale] = createSignal('ru')
export type ModalType = 'auth' | 'subscribe' | 'feedback' | 'thank' | 'donate'
type WarnKind = 'error' | 'warn' | 'info'

export interface Warning {
  body: string
  kind: WarnKind
  seen?: boolean
}

export const MODALS: Record<ModalType, ModalType> = {
  auth: 'auth',
  subscribe: 'subscribe',
  feedback: 'feedback',
  thank: 'thank',
  donate: 'donate'
}

const [modal, setModal] = createSignal<ModalType | null>(null)

const [warnings, setWarnings] = createSignal<Warning[]>([])

export const showModal = (modalType: ModalType) => setModal(modalType)
export const hideModal = () => {
  const { changeSearchParam } = useRouter()
  changeSearchParam('modal', null, true)
  changeSearchParam('mode', null, true)
  setModal(null)
}

export const clearWarns = () => setWarnings([])
export const warn = (warning: Warning) => setWarnings([...warnings(), warning])

export const useWarningsStore = () => {
  return {
    warnings
  }
}

export const useModalStore = () => {
  return {
    modal
  }
}

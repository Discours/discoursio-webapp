//import { persistentAtom } from '@nanostores/persistent'
import { atom } from 'nanostores'
import { useStore } from '@nanostores/solid'
import { createSignal } from 'solid-js'

//export const locale = persistentAtom<string>('locale', 'ru')
export const [locale, setLocale] = createSignal('ru')
export type ModalType = 'auth' | 'subscribe' | 'feedback' | 'share' | 'thank' | 'donate' | null
type WarnKind = 'error' | 'warn' | 'info'

export interface Warning {
  body: string
  kind: WarnKind
  seen?: boolean
}

const modal = atom<ModalType>(null)

const warnings = atom<Warning[]>([])

export const showModal = (modalType: ModalType) => modal.set(modalType)
export const hideModal = () => modal.set(null)
export const toggleModal = (modalType) => modal.get() ? hideModal() : showModal(modalType)

export const clearWarns = () => warnings.set([])
export const warn = (warning: Warning) => warnings.set([...warnings.get(), warning])

export const useWarningsStore = () => {
  const getWarnings = useStore(warnings)
  return {
    getWarnings
  }
}

export const useModalStore = () => {
  const getModal = useStore(modal)

  return {
    getModal
  }
}

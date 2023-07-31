import { createSignal } from 'solid-js'
import { useRouter } from './router'
import type {
  AuthModalSearchParams,
  AuthModalSource,
  ConfirmEmailSearchParams
} from '../components/Nav/AuthModal/types'
import type { RootSearchParams } from '../pages/types'

export type ModalType =
  | 'auth'
  | 'subscribe'
  | 'feedback'
  | 'thank'
  | 'confirm'
  | 'donate'
  | 'inviteToChat'
  | 'uploadImage'
  | 'uploadCoverImage'
  | 'editorInsertLink'

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
  confirm: 'confirm',
  donate: 'donate',
  inviteToChat: 'inviteToChat',
  uploadImage: 'uploadImage',
  uploadCoverImage: 'uploadCoverImage',
  editorInsertLink: 'editorInsertLink'
}

const [modal, setModal] = createSignal<ModalType | null>(null)

const [warnings, setWarnings] = createSignal<Warning[]>([])

const { searchParams, changeSearchParam } = useRouter<
  AuthModalSearchParams & ConfirmEmailSearchParams & RootSearchParams
>()

export const showModal = (modalType: ModalType, modalSource?: AuthModalSource) => {
  if (modalSource) {
    changeSearchParam('source', modalSource)
  }

  setModal(modalType)
}

// TODO: find a better solution
export const hideModal = () => {
  if (searchParams().modal === 'auth') {
    if (searchParams().mode === 'confirm-email') {
      changeSearchParam('token', null, true)
    }
    changeSearchParam('mode', null, true)
  }

  changeSearchParam('modal', null, true)
  changeSearchParam('source', null, true)

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

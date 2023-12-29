import type {
  AuthModalSearchParams,
  AuthModalSource,
  ConfirmEmailSearchParams,
} from '../components/Nav/AuthModal/types'
import type { RootSearchParams } from '../pages/types'

import { createSignal } from 'solid-js'

import { useRouter } from './router'

export type ModalType =
  | 'auth'
  | 'subscribe'
  | 'feedback'
  | 'thank'
  | 'confirm'
  | 'donate'
  | 'inviteToChat'
  | 'uploadImage'
  | 'simplifiedEditorUploadImage'
  | 'uploadCoverImage'
  | 'editorInsertLink'
  | 'followers'
  | 'following'
  | 'inviteCoAuthors'
  | 'share'

export const MODALS: Record<ModalType, ModalType> = {
  auth: 'auth',
  subscribe: 'subscribe',
  feedback: 'feedback',
  thank: 'thank',
  confirm: 'confirm',
  donate: 'donate',
  inviteToChat: 'inviteToChat',
  uploadImage: 'uploadImage',
  simplifiedEditorUploadImage: 'simplifiedEditorUploadImage',
  uploadCoverImage: 'uploadCoverImage',
  editorInsertLink: 'editorInsertLink',
  followers: 'followers',
  following: 'following',
  inviteCoAuthors: 'inviteCoAuthors',
  share: 'share',
}

const [modal, setModal] = createSignal<ModalType>(null)

const { searchParams, changeSearchParams } = useRouter<
  AuthModalSearchParams & ConfirmEmailSearchParams & RootSearchParams
>()

export const showModal = (modalType: ModalType, modalSource?: AuthModalSource) => {
  if (modalSource) {
    changeSearchParams({
      source: modalSource,
    })
  }

  setModal(modalType)
}

// TODO: find a better solution
export const hideModal = () => {
  const newSearchParams: Partial<AuthModalSearchParams & ConfirmEmailSearchParams & RootSearchParams> = {
    modal: null,
    source: null,
  }

  if (searchParams().modal === 'auth') {
    if (searchParams().mode === 'confirm-email') {
      newSearchParams.token = null
    }
    newSearchParams.mode = null
  }

  changeSearchParams(newSearchParams, true)

  setModal(null)
}

export const useModalStore = () => {
  return {
    modal,
  }
}

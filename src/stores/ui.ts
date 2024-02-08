import type {
  AuthModalSearchParams,
  AuthModalSource,
  ConfirmEmailSearchParams
} from '../components/Nav/AuthModal/types'
import type { RootSearchParams } from '../utils/types'

import { createSignal } from 'solid-js'

import { useRouter } from './router'

export type ModalType =
  | 'auth'
  | 'subscribe'
  | 'feedback'
  | 'thank'
  | 'confirm'
  | 'donate'
  | 'uploadImage'
  | 'simplifiedEditorUploadImage'
  | 'uploadCoverImage'
  | 'editorInsertLink'
  | 'followers'
  | 'following'
  | 'search'
  | 'inviteMembers'
  | 'share'
  | 'cropImage'

export const MODALS: Record<ModalType, ModalType> = {
  auth: 'auth',
  subscribe: 'subscribe',
  feedback: 'feedback',
  thank: 'thank',
  confirm: 'confirm',
  donate: 'donate',
  inviteMembers: 'inviteMembers',
  uploadImage: 'uploadImage',
  simplifiedEditorUploadImage: 'simplifiedEditorUploadImage',
  uploadCoverImage: 'uploadCoverImage',
  editorInsertLink: 'editorInsertLink',
  followers: 'followers',
  following: 'following',
  search: 'search',
  share: 'share',
  cropImage: 'cropImage'
}

const [modal, setModal] = createSignal<ModalType>(null)

const { changeSearchParams, clearSearchParams } = useRouter<
  AuthModalSearchParams & ConfirmEmailSearchParams & RootSearchParams
>()

export const showModal = (modalType: ModalType, modalSource?: AuthModalSource) => {
  if (modalSource) {
    changeSearchParams({
      source: modalSource
    })
  }

  setModal(modalType)
}

export const hideModal = () => {
  clearSearchParams()
  setModal(null)
}

export const useModalStore = () => {
  return {
    modal
  }
}

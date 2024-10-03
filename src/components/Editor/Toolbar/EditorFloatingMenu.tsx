import type { Editor } from '@tiptap/core'
import { Show, createEffect, createSignal } from 'solid-js'
import { renderUploadedImage } from '~/components/Upload/renderUploadedImage'
import { Icon } from '~/components/_shared/Icon'
import { useLocalize } from '~/context/localize'
import { useUI } from '~/context/ui'
import { useOutsideClickHandler } from '~/lib/useOutsideClickHandler'
import { UploadedFile } from '~/types/upload'
import { UploadModalContent } from '../../Upload/UploadModalContent'
import { InlineForm } from '../../_shared/InlineForm'
import { Modal } from '../../_shared/Modal'
import { Menu } from './Menu'
import type { MenuItem } from './Menu/Menu'

import styles from './EditorFloatingMenu.module.scss'

type FloatingMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

const embedData = (data: string) => {
  const element = document.createRange().createContextualFragment(data)
  const { attributes } = element.firstChild as HTMLIFrameElement
  const result: { src: string; width?: string; height?: string } = { src: '' }

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes.item(i)
    if (attribute?.name) {
      result[attribute.name as keyof typeof result] = attribute.value as string
    }
  }

  return result
}

export const EditorFloatingMenu = (props: FloatingMenuProps) => {
  const { t } = useLocalize()
  const { showModal, hideModal } = useUI()
  const [selectedMenuItem, setSelectedMenuItem] = createSignal<MenuItem | undefined>()
  const [menuOpen, setMenuOpen] = createSignal<boolean>(false)
  let menuRef: HTMLDivElement | undefined
  let plusButtonRef: HTMLButtonElement | undefined
  const handleEmbedFormSubmit = async (value: string) => {
    // TODO: add support instagram embed (blockquote)
    const emb = await embedData(value)
    props.editor
      ?.chain()
      .focus()
      .insertContent({
        type: 'figure',
        attrs: { 'data-type': 'iframe' },
        content: [
          {
            type: 'iframe',
            attrs: {
              src: emb.src,
              width: emb.width,
              height: emb.height
            }
          },
          {
            type: 'figcaption',
            content: [{ type: 'text', text: t('Description') }]
          }
        ]
      })
      .run()
  }

  const validateEmbed = (value: string) => {
    const element = document.createRange().createContextualFragment(value)
    if (element.firstChild?.nodeName !== 'IFRAME') {
      return t('Error')
    }
  }

  createEffect(() => {
    if (selectedMenuItem() === 'image') {
      showModal('uploadImage')
      return
    }
    if (selectedMenuItem() === 'horizontal-rule') {
      props.editor?.chain().focus().setHorizontalRule().run()
      setSelectedMenuItem()
      return
    }
  })

  const closeUploadModalHandler = () => {
    setSelectedMenuItem()
    setMenuOpen(false)
    setSelectedMenuItem()
  }

  useOutsideClickHandler({
    containerRef: menuRef,
    handler: (e) => {
      if (plusButtonRef?.contains(e.target)) {
        return
      }

      if (menuOpen()) {
        setMenuOpen(false)
        setSelectedMenuItem()
      }
    }
  })

  const handleUpload = (image: UploadedFile) => {
    renderUploadedImage(props.editor, image)
    hideModal()
  }

  return (
    <>
      <div ref={props.ref} class={styles.editorFloatingMenu}>
        <button ref={(el) => (plusButtonRef = el)} type="button" onClick={() => setMenuOpen(!menuOpen())}>
          <Icon name="editor-plus" />
        </button>
        <Show when={menuOpen()}>
          <div class={styles.menuHolder} ref={(el) => (menuRef = el)}>
            <Show when={!selectedMenuItem()}>
              <Menu selectedItem={(value: string) => setSelectedMenuItem(value as MenuItem)} />
            </Show>
            <Show when={selectedMenuItem() === 'embed'}>
              <InlineForm
                placeholder={t('Paste Embed code')}
                showInput={true}
                onClose={closeUploadModalHandler}
                onClear={() => setSelectedMenuItem()}
                validate={(val) => validateEmbed(val) || ''}
                onSubmit={handleEmbedFormSubmit}
              />
            </Show>
          </div>
        </Show>
      </div>
      <Modal variant="narrow" name="uploadImage" onClose={closeUploadModalHandler}>
        <UploadModalContent
          onClose={(value) => {
            handleUpload(value as UploadedFile)
            setSelectedMenuItem()
          }}
        />
      </Modal>
    </>
  )
}

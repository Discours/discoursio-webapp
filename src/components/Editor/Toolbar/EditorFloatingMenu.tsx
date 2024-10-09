import type { Editor } from '@tiptap/core'
import { Show, createEffect, createSignal } from 'solid-js'
import { UploadModalContent } from '~/components/Upload/UploadModalContent/UploadModalContent'
import { renderUploadedImage } from '~/components/Upload/renderUploadedImage'
import { InlineForm } from '~/components/_shared/InlineForm/InlineForm'
import { Modal } from '~/components/_shared/Modal/Modal'
import { useUI } from '~/context/ui'
import { useOutsideClickHandler } from '~/lib/useOutsideClickHandler'
import { UploadedFile } from '~/types/upload'
import { useLocalize } from '../../../context/localize'
import { Icon } from '../../_shared/Icon'
import { Menu, type MenuItem } from './Menu/Menu'

import styles from './EditorFloatingMenu.module.scss'

type FloatingMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

const embedData = (data: string): { [key: string]: string } | undefined => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(data, 'text/html')
  const iframe = doc.querySelector('iframe')

  if (!iframe) {
    return undefined
  }
  const attributes: { [key: string]: string } = {}
  for (const attr of Array.from(iframe.attributes)) {
    attributes[attr.name] = attr.value
  }

  return attributes
}

const validateEmbed = (value: string): boolean => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(value, 'text/html')
  const iframe = doc.querySelector('iframe')

  return !iframe?.getAttribute('src')
}

export const EditorFloatingMenu = (props: FloatingMenuProps) => {
  const { t } = useLocalize()
  const { showModal } = useUI()
  const [selectedMenuItem, setSelectedMenuItem] = createSignal<MenuItem | undefined>()
  const [menuOpen, setMenuOpen] = createSignal<boolean>(false)
  const [menuRef, setMenuRef] = createSignal<HTMLDivElement | undefined>()
  const [plusButtonRef, setPlusButtonRef] = createSignal<HTMLButtonElement | undefined>()
  const handleEmbedFormSubmit = async (value: string) => {
    // TODO: add support instagram embed (blockquote)
    const emb = await embedData(value)
    emb && props.editor.chain().focus().setIframe({ src: emb.src }).run()
  }

  createEffect(() => {
    switch (selectedMenuItem()) {
      case 'image': {
        showModal('uploadImage')
        return
      }
      case 'horizontal-rule': {
        props.editor.chain().focus().setHorizontalRule().run()
        setSelectedMenuItem()
        return
      }
      default: {
        props.editor?.chain().focus().run()
        setSelectedMenuItem()
        return
      }
    }
  })

  const closeUploadModalHandler = () => {
    setSelectedMenuItem()
    setMenuOpen(false)
  }

  useOutsideClickHandler({
    containerRef: menuRef()!,
    handler: (e) => {
      if (plusButtonRef()?.contains(e.target as Node)) {
        return
      }

      if (menuOpen()) {
        setMenuOpen(false)
      }
    }
  })

  const handleUpload = (image: UploadedFile) => {
    renderUploadedImage(props.editor, image)
  }

  return (
    <>
      <div ref={props.ref} class={styles.editorFloatingMenu}>
        <button ref={setPlusButtonRef} type="button" onClick={() => setMenuOpen(!menuOpen())}>
          <Icon name="editor-plus" />
        </button>
        <Show when={menuOpen()}>
          <div class={styles.menuHolder} ref={setMenuRef}>
            <Show when={!selectedMenuItem()}>
              <Menu
                selectedItem={(value: string) => {
                  setSelectedMenuItem(value as MenuItem)
                }}
              />
            </Show>
            <Show when={selectedMenuItem() === 'embed'}>
              <InlineForm
                placeholder={t('Paste Embed code')}
                showInput={true}
                onClose={closeUploadModalHandler}
                onClear={() => setSelectedMenuItem()}
                validate={(value: string) => (validateEmbed(value) ? t('Error') : '')}
                onSubmit={handleEmbedFormSubmit}
              />
            </Show>
          </div>
        </Show>
      </div>
      <Modal variant="narrow" name="uploadImage" onClose={closeUploadModalHandler}>
        <UploadModalContent
          onClose={(value?: UploadedFile) => {
            handleUpload(value as UploadedFile)
            setSelectedMenuItem()
          }}
        />
      </Modal>
    </>
  )
}

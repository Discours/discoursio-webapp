import { createEffect, createSignal, Show } from 'solid-js'
import type { Editor, JSONContent } from '@tiptap/core'
import { Icon } from '../../_shared/Icon'
import { InlineForm } from '../InlineForm'
import styles from './EditorFloatingMenu.module.scss'
import HTMLParser from 'html-to-json-parser'
import { useLocalize } from '../../../context/localize'
import { Modal } from '../../Nav/Modal'
import { Menu } from './Menu'
import type { MenuItem } from './Menu/Menu'
import { showModal } from '../../../stores/ui'
import { UploadModalContent } from '../UploadModalContent'
import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'
import { UploadedFile } from '../../../pages/types'
import { renderUploadedImage } from '../../../utils/renderUploadedImage'

type FloatingMenuProps = {
  editor: Editor
  ref: (el: HTMLDivElement) => void
}

const embedData = async (data) => {
  const result = (await HTMLParser(data, false)) as JSONContent
  if ('type' in result && result.type === 'iframe') {
    return result.attributes
  }
}

export const EditorFloatingMenu = (props: FloatingMenuProps) => {
  const { t } = useLocalize()
  const [selectedMenuItem, setSelectedMenuItem] = createSignal<MenuItem | undefined>()
  const [menuOpen, setMenuOpen] = createSignal<boolean>(false)
  const menuRef: { current: HTMLDivElement } = { current: null }
  const plusButtonRef: { current: HTMLButtonElement } = { current: null }
  const handleEmbedFormSubmit = async (value: string) => {
    // TODO: add support instagram embed (blockquote)
    const emb = await embedData(value)
    props.editor.chain().focus().setIframe(emb).run()
  }

  const validateEmbed = async (value) => {
    const iframeData = (await HTMLParser(value, false)) as JSONContent
    if (iframeData.type !== 'iframe') {
      return t('Error')
    }
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
    }
  })

  const closeUploadModalHandler = () => {
    setSelectedMenuItem()
    setMenuOpen(false)
  }

  useOutsideClickHandler({
    containerRef: menuRef,
    handler: (e) => {
      if (plusButtonRef.current.contains(e.target)) {
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
        <button
          ref={(el) => (plusButtonRef.current = el)}
          type="button"
          onClick={() => setMenuOpen(!menuOpen())}
        >
          <Icon name="editor-plus" />
        </button>
        <Show when={menuOpen()}>
          <div class={styles.menuHolder} ref={(el) => (menuRef.current = el)}>
            <Show when={!selectedMenuItem()}>
              <Menu selectedItem={(value: MenuItem) => setSelectedMenuItem(value)} />
            </Show>
            <Show when={selectedMenuItem() === 'embed'}>
              <InlineForm
                placeholder={t('Paste Embed code')}
                showInput={true}
                onClose={closeUploadModalHandler}
                onClear={() => setSelectedMenuItem()}
                validate={validateEmbed}
                onSubmit={handleEmbedFormSubmit}
              />
            </Show>
          </div>
        </Show>
      </div>
      <Modal variant="narrow" name="uploadImage" onClose={closeUploadModalHandler}>
        <UploadModalContent
          onClose={(value) => {
            handleUpload(value)
            setSelectedMenuItem()
          }}
        />
      </Modal>
    </>
  )
}

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
import { UploadModalContent } from '../UploadModal'

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

const validateEmbed = async (value) => {
  const iframeData = (await HTMLParser(value, false)) as JSONContent
  if (iframeData.type !== 'iframe') {
    return
  }
}

export const EditorFloatingMenu = (props: FloatingMenuProps) => {
  const { t } = useLocalize()
  const [selectedMenuItem, setSelectedMenuItem] = createSignal<MenuItem | undefined>()
  const [menuOpen, setMenuOpen] = createSignal<boolean>(false)
  const handleEmbedFormSubmit = async (value: string) => {
    // TODO: add support instagram embed (blockquote)
    const emb = await embedData(value)
    props.editor.chain().focus().setIframe(emb).run()
  }

  createEffect(() => {
    switch (selectedMenuItem()) {
      case 'image': {
        showModal('uploadImage')
        return
      }
      case 'horizontal-rule': {
        props.editor.chain().focus().setHorizontalRule().run()
        return
      }
    }
  })
  const closeUploadModalHandler = () => {
    setSelectedMenuItem()
    setMenuOpen(false)
  }

  return (
    <>
      <div ref={props.ref} class={styles.editorFloatingMenu}>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(!menuOpen())
          }}
        >
          <Icon name="editor-plus" />
        </button>
        <Show when={menuOpen()}>
          <div class={styles.menuHolder}>
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
                errorMessage={t('Error')}
              />
            </Show>
          </div>
        </Show>
      </div>
      <Modal variant="narrow" name="uploadImage" onClose={closeUploadModalHandler}>
        <UploadModalContent closeCallback={() => setSelectedMenuItem()} editor={props.editor} />
      </Modal>
    </>
  )
}

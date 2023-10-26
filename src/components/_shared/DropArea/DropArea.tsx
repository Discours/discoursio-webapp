import { clsx } from 'clsx'
import styles from './DropArea.module.scss'
import { createSignal, JSX, Show } from 'solid-js'
import { createDropzone, createFileUploader } from '@solid-primitives/upload'
import { useLocalize } from '../../../context/localize'
import { validateFiles } from '../../../utils/validateFile'
import type { FileTypeToUpload } from '../../../pages/types'
import { handleFileUpload1 } from '../../../utils/handleFileUpload'
import { UploadedFile } from '../../../pages/types'
import { handleImageUpload } from '../../../utils/handleImageUpload'

type Props = {
  class?: string
  placeholder: string
  isMultiply: boolean
  fileType: FileTypeToUpload
  onUpload: (value: UploadedFile[]) => void
  description?: string | JSX.Element
  isSquare?: boolean
}

export const DropArea = (props: Props) => {
  const { t } = useLocalize()
  const [dragActive, setDragActive] = createSignal(false)
  const [dropAreaError, setDropAreaError] = createSignal<string>()
  const [loading, setLoading] = createSignal(false)

  const runUpload = async (files) => {
    try {
      setLoading(true)

      const results: UploadedFile[] = []
      for (const file of files) {
        const handler = file.type.startsWith('image/') ? handleImageUpload : handleFileUpload1
        const result = await handler(file)
        results.push(result)
      }
      props.onUpload(results)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setDropAreaError(t('Upload error'))
      console.error('[runUpload]', error)
    }
  }

  const initUpload = async (selectedFiles) => {
    if (!props.isMultiply && files.length > 1) {
      setDropAreaError(t('Many files, choose only one'))
      return
    }
    const isValid = validateFiles(props.fileType, selectedFiles)
    if (isValid) {
      await runUpload(selectedFiles)
    } else {
      setDropAreaError(t('Invalid file type'))
      return false
    }
  }

  const { files, selectFiles } = createFileUploader({
    multiple: true,
    accept: `${props.fileType}/*`
  })

  const { setRef: dropzoneRef, files: droppedFiles } = createDropzone({
    onDrop: async () => {
      setDragActive(false)
      await initUpload(droppedFiles())
    }
  })
  const handleDrag = (event) => {
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true)
    } else if (event.type === 'dragleave') {
      setDragActive(false)
    }
  }
  const handleDropFieldClick = async () => {
    selectFiles((selectedFiles) => {
      const filesArray = selectedFiles.map((file) => {
        return file
      })
      initUpload(filesArray)
    })
  }

  return (
    <div class={clsx(styles.DropArea, props.class, props.isSquare && styles['square'])}>
      <div
        class={clsx(styles.field, { [styles.active]: dragActive() })}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        ref={dropzoneRef}
        onClick={handleDropFieldClick}
      >
        <div class={styles.text}>{loading() ? 'Loading...' : props.placeholder}</div>
        <Show when={!loading() && props.isSquare && props.description}>
          <div class={styles.description}>{props.description}</div>
        </Show>
      </div>
      <Show when={dropAreaError()}>
        <div class={styles.error}>{dropAreaError()}</div>
      </Show>
      <Show when={!dropAreaError() && props.description && !props.isSquare}>
        <div class={styles.description}>{props.description}</div>
      </Show>
    </div>
  )
}

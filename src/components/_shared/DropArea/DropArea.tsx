import type { FileTypeToUpload } from '../../../utils/types'

import { createDropzone, createFileUploader } from '@solid-primitives/upload'
import { clsx } from 'clsx'
import { JSX, Show, createSignal } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { handleFileUpload } from '../../../utils/handleFileUpload'
import { handleImageUpload } from '../../../utils/handleImageUpload'
import { UploadedFile } from '../../../utils/types'
import { validateFiles } from '../../../utils/validateFile'

import styles from './DropArea.module.scss'

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
        const handler = props.fileType === 'image' ? handleImageUpload : handleFileUpload
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
    <div class={clsx(styles.DropArea, props.class, props.isSquare && styles.square)}>
      <div
        class={clsx(styles.field, { [styles.active]: dragActive() })}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        ref={dropzoneRef}
        onClick={handleDropFieldClick}
      >
        <div class={styles.text}>{loading() ? t('Loading') : props.placeholder}</div>
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

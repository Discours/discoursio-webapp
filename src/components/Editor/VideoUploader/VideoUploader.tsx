import { clsx } from 'clsx'
import styles from './VideoUploader.module.scss'
import { useLocalize } from '../../../context/localize'
import { createDropzone } from '@solid-primitives/upload'
import { createEffect, createSignal, Show } from 'solid-js'
import { useSnackbar } from '../../../context/snackbar'
import { validateUrl } from '../../../utils/validateUrl'
import { VideoPlayer } from '../../_shared/VideoPlayer'
// import { handleFileUpload } from '../../../utils/handleFileUpload'

type VideoItem = {
  url: string
  title: string
  body: string
}

type Props = {
  class?: string
  data: (value: VideoItem) => void
}

export const VideoUploader = (props: Props) => {
  const { t } = useLocalize()
  const [dragActive, setDragActive] = createSignal(false)
  const [dragError, setDragError] = createSignal<string>()
  const [incorrectUrl, setIncorrectUrl] = createSignal<boolean>(false)
  const [data, setData] = createSignal<VideoItem>()

  const updateData = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  createEffect(() => {
    props.data(data())
  })

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const urlInput: {
    current: HTMLInputElement
  } = {
    current: null
  }

  // const [videoUrl, setVideoUrl] = createSignal<string | undefined>()
  // const runUpload = async (file) => {
  //   try {
  //     const fileUrl = await handleFileUpload(file)
  //     setVideoUrl(fileUrl)
  //   } catch (error) {
  //     console.error('[runUpload]', error)
  //   }
  // }

  const { setRef: dropzoneRef, files: droppedFiles } = createDropzone({
    onDrop: async () => {
      setDragActive(false)
      if (droppedFiles().length > 1) {
        setDragError(t('Many files, choose only one'))
      } else if (droppedFiles()[0].file.type.startsWith('video/')) {
        await showSnackbar({
          body: t(
            'This functionality is currently not available, we would like to work on this issue. Use the download link.'
          )
        })
        // await runUpload(droppedFiles()[0])
      } else {
        setDragError(t('Video format not supported'))
      }
    }
  })
  const handleDrag = (event) => {
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true)
      setDragError()
    } else if (event.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleUrlInput = async (value: string) => {
    if (validateUrl(value)) {
      updateData('url', value)
    } else {
      setIncorrectUrl(true)
    }
  }

  return (
    <div class={clsx(styles.VideoUploader, props.class)}>
      <Show
        when={data() && data().url}
        fallback={
          <>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onClick={() =>
                showSnackbar({
                  body: t(
                    'This functionality is currently not available, we would like to work on this issue. Use the download link.'
                  )
                })
              }
              ref={dropzoneRef}
              class={clsx(styles.dropArea, { [styles.active]: dragActive() })}
            >
              <div class={styles.text}>{t('Upload video')}</div>
            </div>
            <Show when={dragError()}>
              <div class={styles.error}>{dragError()}</div>
            </Show>
            <div class={styles.inputHolder}>
              <input
                class={clsx(styles.urlInput, { [styles.hasError]: incorrectUrl() })}
                ref={(el) => (urlInput.current = el)}
                type="text"
                placeholder={t('Insert video link')}
                onChange={(event) => handleUrlInput(event.currentTarget.value)}
              />
            </div>
            <Show when={incorrectUrl()}>
              <div class={styles.error}>{t('It does not look like url')}</div>
            </Show>
          </>
        }
      >
        <VideoPlayer
          deleteAction={() => setData()}
          videoUrl={data().url}
          title={data().title}
          description={data().body}
        />
      </Show>
    </div>
  )
}

import { Accessor, createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { useLocalize } from '../../context/localize'
import { clsx } from 'clsx'
import { Title } from '@solidjs/meta'
import type { Shout, Topic } from '../../graphql/types.gen'
import { useRouter } from '../../stores/router'
import { ShoutForm, useEditorContext } from '../../context/editor'
import { Editor, Panel } from '../Editor'
import { Icon } from '../_shared/Icon'
import styles from './Edit.module.scss'
import { imageProxy } from '../../utils/imageProxy'
import { GrowingTextarea } from '../_shared/GrowingTextarea'
import { VideoUploader } from '../Editor/VideoUploader'
import { AudioUploader } from '../Editor/AudioUploader'
import { slugify } from '../../utils/slugify'
import { SolidSwiper } from '../_shared/SolidSwiper'
import { DropArea } from '../_shared/DropArea'
import { LayoutType, MediaItem } from '../../pages/types'
import { clone } from '../../utils/clone'
import deepEqual from 'fast-deep-equal'
import { AutoSaveNotice } from '../Editor/AutoSaveNotice'
import { PublishSettings } from './PublishSettings'
import { createStore } from 'solid-js/store'

type Props = {
  shout: Shout
}

export const EMPTY_TOPIC: Topic = {
  id: -1,
  slug: ''
}

const AUTO_SAVE_INTERVAL = 5000
const handleScrollTopButtonClick = (e) => {
  e.preventDefault()
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

export const EditView = (props: Props) => {
  const { t } = useLocalize()
  const [isScrolled, setIsScrolled] = createSignal(false)

  const { page } = useRouter()

  const {
    form,
    formErrors,
    actions: { setForm, setFormErrors, saveDraft, saveDraftToLocalStorage, getDraftFromLocalStorage }
  } = useEditorContext()

  const shoutTopics = props.shout.topics || []

  const draft = getDraftFromLocalStorage(props.shout.id)
  if (draft) {
    setForm(draft)
  } else {
    setForm({
      slug: props.shout.slug,
      shoutId: props.shout.id,
      title: props.shout.title,
      subtitle: props.shout.subtitle,
      selectedTopics: shoutTopics,
      mainTopic: shoutTopics.find((topic) => topic.slug === props.shout.mainTopic) || EMPTY_TOPIC,
      body: props.shout.body,
      coverImageUrl: props.shout.cover,
      media: props.shout.media,
      layout: props.shout.layout
    })
  }

  const [prevForm, setPrevForm] = createStore<ShoutForm>(clone(form))
  const [saving, setSaving] = createSignal(false)

  const mediaItems: Accessor<MediaItem[]> = createMemo(() => {
    return JSON.parse(form.media || '[]')
  })

  onMount(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    onCleanup(() => {
      window.removeEventListener('scroll', handleScroll)
    })
  })

  onMount(() => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const handleBeforeUnload = (event) => {
      if (!deepEqual(prevForm, form)) {
        event.returnValue = t(
          `There are unsaved changes in your publishing settings. Are you sure you want to leave the page without saving?`
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    onCleanup(() => window.removeEventListener('beforeunload', handleBeforeUnload))
  })

  const handleTitleInputChange = (value) => {
    setForm('title', value)
    setForm('slug', slugify(value))
    if (value) {
      setFormErrors('title', '')
    }
  }

  const handleAddMedia = (data) => {
    const newMedia = [...mediaItems(), ...data]
    setForm('media', JSON.stringify(newMedia))
  }
  const handleSortedMedia = (data) => {
    setForm('media', JSON.stringify(data))
  }

  const handleMediaDelete = (index) => {
    const copy = [...mediaItems()]
    copy.splice(index, 1)
    setForm('media', JSON.stringify(copy))
  }

  const handleMediaChange = (index, value) => {
    const updated = mediaItems().map((item, idx) => (idx === index ? value : item))
    setForm('media', JSON.stringify(updated))
  }

  const [baseAudioFields, setBaseAudioFields] = createSignal({
    artist: '',
    date: '',
    genre: ''
  })

  const handleBaseFieldsChange = (key, value) => {
    if (mediaItems().length > 0) {
      const updated = mediaItems().map((media) => ({ ...media, [key]: value }))
      setForm('media', JSON.stringify(updated))
    } else {
      setBaseAudioFields({ ...baseAudioFields(), [key]: value })
    }
  }

  const articleTitle = () => {
    switch (props.shout.layout as LayoutType) {
      case 'audio': {
        return t('Album name')
      }
      case 'image': {
        return t('Gallery name')
      }
      default: {
        return t('Header')
      }
    }
  }

  const pageTitle = () => {
    switch (props.shout.layout as LayoutType) {
      case 'audio': {
        return t('Publish Album')
      }
      case 'image': {
        return t('Create gallery')
      }
      case 'video': {
        return t('Create video')
      }
      case 'literature': {
        return t('New literary work')
      }
      default: {
        return t('Write an article')
      }
    }
  }

  let autoSaveTimeOutId

  const autoSaveRecursive = () => {
    autoSaveTimeOutId = setTimeout(async () => {
      const hasChanges = !deepEqual(form, prevForm)
      if (hasChanges) {
        setSaving(true)
        if (props.shout.visibility === 'owner') {
          await saveDraft(form)
        } else {
          saveDraftToLocalStorage(form)
        }
        setPrevForm(clone(form))
        setTimeout(() => {
          setSaving(false)
        }, 2000)
      }
      autoSaveRecursive()
    }, AUTO_SAVE_INTERVAL)
  }

  const stopAutoSave = () => {
    clearTimeout(autoSaveTimeOutId)
  }

  onMount(() => {
    autoSaveRecursive()
  })

  onCleanup(() => {
    stopAutoSave()
  })

  return (
    <>
      <div class={styles.container}>
        <Title>{pageTitle()}</Title>
        <form>
          <div class="wide-container">
            <AutoSaveNotice active={saving()} />
            <button
              class={clsx(styles.scrollTopButton, {
                [styles.visible]: isScrolled()
              })}
              onClick={handleScrollTopButtonClick}
            >
              <Icon name="up-button" class={styles.icon} />
              <span class={styles.scrollTopButtonLabel}>{t('Scroll up')}</span>
            </button>

            <div class="row">
              <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
                <Show when={page().route === 'edit'}>
                  <>
                    <div class={clsx({ [styles.audioHeader]: props.shout.layout === 'audio' })}>
                      <div class={styles.inputContainer}>
                        <GrowingTextarea
                          allowEnterKey={true}
                          value={(value) => handleTitleInputChange(value)}
                          class={styles.titleInput}
                          placeholder={articleTitle()}
                          initialValue={form.title}
                          maxLength={100}
                        />

                        <Show when={formErrors.title}>
                          <div class={styles.validationError}>{formErrors.title}</div>
                        </Show>

                        <Show when={props.shout.layout === 'audio'}>
                          <div class={styles.additional}>
                            <input
                              type="text"
                              placeholder={t('Artist...')}
                              class={styles.additionalInput}
                              value={mediaItems()[0]?.artist || ''}
                              onChange={(event) => handleBaseFieldsChange('artist', event.target.value)}
                            />
                            <input
                              type="number"
                              min="1900"
                              max={new Date().getFullYear()}
                              step="1"
                              class={styles.additionalInput}
                              placeholder={t('Release date...')}
                              value={mediaItems()[0]?.date || ''}
                              onChange={(event) => handleBaseFieldsChange('date', event.target.value)}
                            />
                            <input
                              type="text"
                              placeholder={t('Genre...')}
                              class={styles.additionalInput}
                              value={mediaItems()[0]?.genre || ''}
                              onChange={(event) => handleBaseFieldsChange('genre', event.target.value)}
                            />
                          </div>
                        </Show>

                        <Show when={props.shout.layout !== 'audio'}>
                          <GrowingTextarea
                            allowEnterKey={false}
                            value={(value) => setForm('subtitle', value)}
                            class={styles.subtitleInput}
                            placeholder={t('Subheader')}
                            initialValue={form.subtitle}
                            maxLength={100}
                          />
                        </Show>
                      </div>
                      <Show when={props.shout.layout === 'audio'}>
                        <Show
                          when={form.coverImageUrl}
                          fallback={
                            <DropArea
                              isSquare={true}
                              placeholder={t('Add cover')}
                              description={
                                <>
                                  {t('min. 1400×1400 pix')}
                                  <br />
                                  {t('jpg, .png, max. 10 mb.')}
                                </>
                              }
                              isMultiply={false}
                              fileType={'image'}
                              onUpload={(val) => setForm('coverImageUrl', val[0].url)}
                            />
                          }
                        >
                          <div
                            class={styles.cover}
                            style={{ 'background-image': `url(${imageProxy(form.coverImageUrl)})` }}
                          />
                        </Show>
                      </Show>
                    </div>

                    <Show when={props.shout.layout === 'image'}>
                      <SolidSwiper
                        editorMode={true}
                        images={mediaItems()}
                        onImageChange={handleMediaChange}
                        onImageDelete={(index) => handleMediaDelete(index)}
                        onImagesAdd={(value) => handleAddMedia(value)}
                        onImagesSorted={(value) => handleSortedMedia(value)}
                      />
                    </Show>

                    <Show when={props.shout.layout === 'video'}>
                      <VideoUploader
                        video={mediaItems()}
                        onVideoAdd={(data) => handleAddMedia(data)}
                        onVideoDelete={(index) => handleMediaDelete(index)}
                      />
                    </Show>

                    <Show when={props.shout.layout === 'audio'}>
                      <AudioUploader
                        audio={mediaItems()}
                        baseFields={baseAudioFields()}
                        onAudioAdd={(value) => handleAddMedia(value)}
                        onAudioChange={handleMediaChange}
                        onAudioSorted={(value) => handleSortedMedia(value)}
                      />
                    </Show>
                  </>
                </Show>
                <Show when={page().route === 'editSettings'}>
                  <PublishSettings shoutId={props.shout.id} form={form} />
                </Show>
              </div>
            </div>
            <Show when={page().route === 'edit'}>
              <Editor
                shoutId={form.shoutId}
                initialContent={form.body}
                onChange={(body) => setForm('body', body)}
              />
            </Show>
          </div>
        </form>
      </div>

      <Panel shoutId={props.shout.id} />
    </>
  )
}

export default EditView

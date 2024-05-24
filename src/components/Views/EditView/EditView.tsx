import { clsx } from 'clsx'
import deepEqual from 'fast-deep-equal'
import { Accessor, Show, createMemo, createSignal, lazy, onCleanup, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import { debounce } from 'throttle-debounce'

import { ShoutForm, useEditorContext } from '../../../context/editor'
import { useLocalize } from '../../../context/localize'
import type { Shout, Topic } from '../../../graphql/schema/core.gen'
import { LayoutType, MediaItem } from '../../../pages/types'
import { useRouter } from '../../../stores/router'
import { clone } from '../../../utils/clone'
import { getImageUrl } from '../../../utils/getImageUrl'
import { isDesktop } from '../../../utils/media-query'
import { slugify } from '../../../utils/slugify'
import { Editor, Panel } from '../../Editor'
import { AudioUploader } from '../../Editor/AudioUploader'
import { AutoSaveNotice } from '../../Editor/AutoSaveNotice'
import { VideoUploader } from '../../Editor/VideoUploader'
import { Modal } from '../../Nav/Modal'
import { TableOfContents } from '../../TableOfContents'
import { DropArea } from '../../_shared/DropArea'
import { Icon } from '../../_shared/Icon'
import { InviteMembers } from '../../_shared/InviteMembers'
import { Popover } from '../../_shared/Popover'
import { EditorSwiper } from '../../_shared/SolidSwiper'

import { PublishSettings } from '../PublishSettings'

import styles from './EditView.module.scss'
import { Loading } from '../../_shared/Loading'

const SimplifiedEditor = lazy(() => import('../../Editor/SimplifiedEditor'))
const GrowingTextarea = lazy(() => import('../../_shared/GrowingTextarea/GrowingTextarea'))

type Props = {
  shout: Shout
}

export const MAX_HEADER_LIMIT = 100
export const EMPTY_TOPIC: Topic = {
  id: -1,
  slug: '',
}

const AUTO_SAVE_DELAY = 3000

const handleScrollTopButtonClick = (e) => {
  e.preventDefault()
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

export const EditView = (props: Props) => {
  const { t } = useLocalize()
  const [isScrolled, setIsScrolled] = createSignal(false)
  const { page } = useRouter()
  const {
    form,
    formErrors,
    setForm,
    setFormErrors,
    saveDraft,
    saveDraftToLocalStorage,
    getDraftFromLocalStorage,
  } = useEditorContext()
  const shoutTopics = props.shout.topics || []

  const draft = getDraftFromLocalStorage(props.shout.id)

  if (draft) {
    const draftForm = Object.keys(draft).length !== 0 ? draft : { shoutId: props.shout.id }
    setForm(draftForm)
    console.debug('draft from localstorage: ', draftForm)
  } else {
    const draftForm = {
      slug: props.shout.slug,
      shoutId: props.shout.id,
      title: props.shout.title,
      lead: props.shout.lead,
      description: props.shout.description,
      subtitle: props.shout.subtitle,
      selectedTopics: shoutTopics,
      mainTopic: shoutTopics[0],
      body: props.shout.body,
      coverImageUrl: props.shout.cover,
      media: props.shout.media,
      layout: props.shout.layout,
    }
    setForm(draftForm)
    console.debug('draft from props data: ', draftForm)
  }

  const subtitleInput: { current: HTMLTextAreaElement } = { current: null }

  const [prevForm, setPrevForm] = createStore<ShoutForm>(clone(form))
  const [saving, setSaving] = createSignal(false)
  const [isSubtitleVisible, setIsSubtitleVisible] = createSignal(Boolean(form.subtitle))
  const [isLeadVisible, setIsLeadVisible] = createSignal(Boolean(form.lead))

  const mediaItems: Accessor<MediaItem[]> = createMemo(() => {
    return JSON.parse(form.media || '[]')
  })

  const [hasChanges, setHasChanges] = createSignal(false)

  onMount(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    onCleanup(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    const handleBeforeUnload = (event) => {
      if (!deepEqual(prevForm, form)) {
        event.returnValue = t(
          'There are unsaved changes in your publishing settings. Are you sure you want to leave the page without saving?',
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    onCleanup(() => window.removeEventListener('beforeunload', handleBeforeUnload))
  })

  const handleTitleInputChange = (value: string) => {
    handleInputChange('title', value)
    handleInputChange('slug', slugify(value))
    if (value) {
      setFormErrors('title', '')
    }
  }

  const handleAddMedia = (data) => {
    const newMedia = [...mediaItems(), ...data]
    handleInputChange('media', JSON.stringify(newMedia))
  }
  const handleSortedMedia = (data) => {
    handleInputChange('media', JSON.stringify(data))
  }

  const handleMediaDelete = (index) => {
    const copy = [...mediaItems()]
    copy.splice(index, 1)
    handleInputChange('media', JSON.stringify(copy))
  }

  const handleMediaChange = (index, value) => {
    const updated = mediaItems().map((item, idx) => (idx === index ? value : item))
    handleInputChange('media', JSON.stringify(updated))
  }

  const [baseAudioFields, setBaseAudioFields] = createSignal({
    artist: '',
    date: '',
    genre: '',
  })

  const handleBaseFieldsChange = (key, value) => {
    if (mediaItems().length > 0) {
      const updated = mediaItems().map((media) => ({ ...media, [key]: value }))
      handleInputChange('media', JSON.stringify(updated))
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

  const autoSave = async () => {
    console.log('autoSave called')
    if (hasChanges()) {
      console.debug('saving draft', form)
      setSaving(true)
      saveDraftToLocalStorage(form)
      await saveDraft(form)
      setPrevForm(clone(form))
      setSaving(false)
      setHasChanges(false)
    }
  }

  const debouncedAutoSave = debounce(AUTO_SAVE_DELAY, autoSave)

  const handleInputChange = (key, value) => {
    console.log(`[handleInputChange] ${key}: ${value}`)
    setForm(key, value)
    setHasChanges(true)
    debouncedAutoSave()
  }

  onMount(() => {
    onCleanup(() => {
      debouncedAutoSave.cancel()
    })
  })

  const showSubtitleInput = () => {
    setIsSubtitleVisible(true)
    subtitleInput.current.focus()
  }

  const showLeadInput = () => {
    setIsLeadVisible(true)
  }

  return (
    <>
      <div class={styles.container}>
        <form>
          <div class="wide-container">
            <button
              class={clsx(styles.scrollTopButton, {
                [styles.visible]: isScrolled(),
              })}
              onClick={handleScrollTopButtonClick}
            >
              <Icon name="up-button" class={styles.icon} />
              <span class={styles.scrollTopButtonLabel}>{t('Scroll up')}</span>
            </button>

            <AutoSaveNotice active={saving()} />

            <div class={styles.wrapperTableOfContents}>
              <Show when={isDesktop() && form.body}>
                <TableOfContents variant="editor" parentSelector="#editorBody" body={form.body} />
              </Show>
            </div>

            <div class="row">
              <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
                <Show when={page().route === 'edit'}>
                  <div class={styles.headingActions}>
                    <Show when={!isSubtitleVisible() && props.shout.layout !== 'audio'}>
                      <div class={styles.action} onClick={showSubtitleInput}>
                        {t('Add subtitle')}
                      </div>
                    </Show>
                    <Show when={!isLeadVisible() && props.shout.layout !== 'audio'}>
                      <div class={styles.action} onClick={showLeadInput}>
                        {t('Add intro')}
                      </div>
                    </Show>
                  </div>
                  <>
                    <div class={clsx({ [styles.audioHeader]: props.shout.layout === 'audio' })}>
                      <div class={styles.inputContainer}>
                        <GrowingTextarea
                          allowEnterKey={true}
                          value={(value) => handleTitleInputChange(value)}
                          class={styles.titleInput}
                          placeholder={articleTitle()}
                          initialValue={form.title}
                          maxLength={MAX_HEADER_LIMIT}
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
                          <Show when={isSubtitleVisible()}>
                            <GrowingTextarea
                              textAreaRef={(el) => {
                                subtitleInput.current = el
                              }}
                              allowEnterKey={false}
                              value={(value) => handleInputChange('subtitle', value || '')}
                              class={styles.subtitleInput}
                              placeholder={t('Subheader')}
                              initialValue={form.subtitle || ''}
                              maxLength={MAX_HEADER_LIMIT}
                            />
                          </Show>
                          <Show when={isLeadVisible()}>
                            <SimplifiedEditor
                              variant="minimal"
                              onlyBubbleControls={true}
                              smallHeight={true}
                              placeholder={t('A short introduction to keep the reader interested')}
                              initialContent={form.lead}
                              onChange={(value) => handleInputChange('lead', value)}
                            />
                          </Show>
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
                              onUpload={(val) => handleInputChange('coverImageUrl', val[0].url)}
                            />
                          }
                        >
                          <div
                            class={styles.cover}
                            style={{
                              'background-image': `url(${getImageUrl(form.coverImageUrl, {
                                width: 1600,
                              })})`,
                            }}
                          >
                            <Popover content={t('Delete cover')}>
                              {(triggerRef: (el) => void) => (
                                <div
                                  ref={triggerRef}
                                  class={styles.delete}
                                  onClick={() => handleInputChange('coverImageUrl', null)}
                                >
                                  <Icon name="close-white" />
                                </div>
                              )}
                            </Popover>
                          </div>
                        </Show>
                      </Show>
                    </div>

                    <Show when={props.shout.layout === 'image'}>
                      <EditorSwiper
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
              </div>
            </div>
            <Show when={page().route === 'edit' && form?.shoutId} fallback={<Loading />}>
              <Editor
                shoutId={form.shoutId}
                initialContent={form.body}
                onChange={(body) => handleInputChange('body', body)}
              />
            </Show>
          </div>
        </form>
      </div>
      <Show when={page().route === 'editSettings'}>
        <PublishSettings shoutId={props.shout.id} form={form} />
      </Show>
      <Panel shoutId={props.shout.id} />

      <Modal variant="medium" name="inviteCoauthors">
        <InviteMembers variant={'coauthors'} title={t('Invite experts')} />
      </Modal>
    </>
  )
}

export default EditView

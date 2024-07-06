import { clsx } from 'clsx'
import deepEqual from 'fast-deep-equal'
import {
  Accessor,
  Show,
  createEffect,
  createMemo,
  createSignal,
  lazy,
  on,
  onCleanup,
  onMount
} from 'solid-js'
import { createStore } from 'solid-js/store'
import { debounce } from 'throttle-debounce'
import { DropArea } from '~/components/_shared/DropArea'
import { Icon } from '~/components/_shared/Icon'
import { InviteMembers } from '~/components/_shared/InviteMembers'
import { Loading } from '~/components/_shared/Loading'
import { Popover } from '~/components/_shared/Popover'
import { EditorSwiper } from '~/components/_shared/SolidSwiper'
import { ShoutForm, useEditorContext } from '~/context/editor'
import { useGraphQL } from '~/context/graphql'
import { useLocalize } from '~/context/localize'
import getMyShoutQuery from '~/graphql/query/core/article-my'
import type { Shout, Topic } from '~/graphql/schema/core.gen'
import { slugify } from '~/intl/translit'
import { getImageUrl } from '~/lib/getImageUrl'
import { LayoutType } from '~/types/common'
import { MediaItem } from '~/types/mediaitem'
import { clone } from '~/utils/clone'
import { isDesktop } from '~/utils/media-query'
import { Editor, Panel } from '../../Editor'
import { AudioUploader } from '../../Editor/AudioUploader'
import { AutoSaveNotice } from '../../Editor/AutoSaveNotice'
import { VideoUploader } from '../../Editor/VideoUploader'
import { Modal } from '../../Nav/Modal'
import { TableOfContents } from '../../TableOfContents'
import styles from './EditView.module.scss'

const SimplifiedEditor = lazy(() => import('../../Editor/SimplifiedEditor'))
const GrowingTextarea = lazy(() => import('~/components/_shared/GrowingTextarea/GrowingTextarea'))

type Props = {
  shout: Shout
}

export const MAX_HEADER_LIMIT = 100
export const EMPTY_TOPIC: Topic = {
  id: -1,
  slug: ''
}

const AUTO_SAVE_DELAY = 3000

const handleScrollTopButtonClick = (ev: MouseEvent | TouchEvent) => {
  ev.preventDefault()
  window?.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

export const EditView = (props: Props) => {
  const { t } = useLocalize()
  const [isScrolled, setIsScrolled] = createSignal(false)
  const { query } = useGraphQL()
  const {
    form,
    formErrors,
    setForm,
    setFormErrors,
    saveDraft,
    saveDraftToLocalStorage,
    getDraftFromLocalStorage
  } = useEditorContext()
  const [shoutTopics, setShoutTopics] = createSignal<Topic[]>([])
  const [draft, setDraft] = createSignal()
  let subtitleInput: HTMLTextAreaElement | null
  const [prevForm, setPrevForm] = createStore<ShoutForm>(clone(form))
  const [saving, setSaving] = createSignal(false)
  const [isSubtitleVisible, setIsSubtitleVisible] = createSignal(Boolean(form.subtitle))
  const [isLeadVisible, setIsLeadVisible] = createSignal(Boolean(form.lead))
  const mediaItems: Accessor<MediaItem[]> = createMemo(() => JSON.parse(form.media || '[]'))

  createEffect(
    on(
      () => props.shout,
      (shout) => {
        if (shout) {
          console.debug(`[EditView] shout is loaded: ${shout}`)
          setShoutTopics((shout.topics as Topic[]) || [])
          const stored = getDraftFromLocalStorage(shout.id)
          if (stored) {
            console.info(`[EditView] got stored shout: ${stored}`)
            setDraft(stored)
          } else {
            if (!shout.slug) {
              console.warn(`[EditView] shout has no slug! ${shout}`)
            }
            const draftForm = {
              slug: shout.slug || '',
              shoutId: shout.id || 0,
              title: shout.title || '',
              lead: shout.lead || '',
              description: shout.description || '',
              subtitle: shout.subtitle || '',
              selectedTopics: (shoutTopics() || []) as Topic[],
              mainTopic: shoutTopics()[0] || '',
              body: shout.body || '',
              coverImageUrl: shout.cover || '',
              media: shout.media || '',
              layout: shout.layout
            }
            setForm((_) => draftForm)
            console.debug('draft from props data: ', draftForm)
          }
        }
      },
      { defer: true }
    )
  )

  createEffect(
    on(
      draft,
      (d) => {
        if (d) {
          const draftForm = Object.keys(d).length !== 0 ? d : { shoutId: props.shout.id }
          setForm(draftForm)
          console.debug('draft from localstorage: ', draftForm)
        }
      },
      { defer: true }
    )
  )

  createEffect(
    on(
      () => props.shout?.id,
      async (shoutId) => {
        if (shoutId) {
          const resp = await query(getMyShoutQuery, { shout_id: shoutId })
          const result = resp?.data?.get_my_shout
          if (result) {
            console.debug('[EditView] getMyShout result: ', result)
            const { shout: loadedShout, error } = result
            setDraft(loadedShout)
            console.debug('[EditView] loadedShout:', loadedShout)
            console.log(error)
          }
        }
      },
      { defer: true }
    )
  )

  onMount(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    onCleanup(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!deepEqual(prevForm, form)) {
        event.returnValue = t(
          'There are unsaved changes in your publishing settings. Are you sure you want to leave the page without saving?'
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

  const handleAddMedia = (data: MediaItem[]) => {
    const newMedia = [...mediaItems(), ...data]
    handleInputChange('media', JSON.stringify(newMedia))
  }
  const handleSortedMedia = (data: MediaItem[]) => {
    handleInputChange('media', JSON.stringify(data))
  }

  const handleMediaDelete = (index: number) => {
    const copy = [...mediaItems()]
    if (copy?.length > 0) copy.splice(index, 1)
    handleInputChange('media', JSON.stringify(copy))
  }

  const handleMediaChange = (index: number, value: MediaItem) => {
    const updated = mediaItems().map((item, idx) => (idx === index ? value : item))
    handleInputChange('media', JSON.stringify(updated))
  }

  const [baseAudioFields, setBaseAudioFields] = createSignal({
    artist: '',
    date: '',
    genre: ''
  })

  const handleBaseFieldsChange = (key: string, value: string) => {
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
  const [hasChanges, setHasChanges] = createSignal(false)
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

  const handleInputChange = (key: keyof ShoutForm, value: string) => {
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
    subtitleInput?.focus()
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
                [styles.visible]: isScrolled()
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
                <Show when={props.shout}>
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
                              textAreaRef={(el) => (subtitleInput = el)}
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
                              'background-image': `url(${getImageUrl(form.coverImageUrl || '', {
                                width: 1600
                              })})`
                            }}
                          >
                            <Popover content={t('Delete cover')}>
                              {(triggerRef: (_el: HTMLElement | null) => void) => (
                                <div
                                  ref={triggerRef}
                                  class={styles.delete}
                                  onClick={() => handleInputChange('coverImageUrl', '')}
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
                        onImagesAdd={(value: MediaItem[]) => handleAddMedia(value)}
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
            <Show when={form?.shoutId} fallback={<Loading />}>
              <Editor
                shoutId={form.shoutId}
                initialContent={form.body}
                onChange={(body) => handleInputChange('body', body)}
              />
            </Show>
          </div>
        </form>
      </div>
      <Show when={props.shout}>
        <Panel shoutId={props.shout.id} />
      </Show>

      <Modal variant="medium" name="inviteCoauthors">
        <InviteMembers variant={'coauthors'} title={t('Invite experts')} />
      </Modal>
    </>
  )
}

export default EditView

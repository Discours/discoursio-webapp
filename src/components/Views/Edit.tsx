import { Accessor, createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { useLocalize } from '../../context/localize'
import { clsx } from 'clsx'
import { Title } from '@solidjs/meta'
import type { Shout, Topic } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { useRouter } from '../../stores/router'
import { useEditorContext } from '../../context/editor'
import { Editor, Panel, TopicSelect, UploadModalContent } from '../Editor'
import { Icon } from '../_shared/Icon'
import { Button } from '../_shared/Button'
import styles from './Edit.module.scss'
import { useSession } from '../../context/session'
import { Modal } from '../Nav/Modal'
import { hideModal, showModal } from '../../stores/ui'
import { imageProxy } from '../../utils/imageProxy'
import { GrowingTextarea } from '../_shared/GrowingTextarea'
import { VideoUploader } from '../Editor/VideoUploader'
import { AudioUploader } from '../Editor/AudioUploader'
import { slugify } from '../../utils/slugify'
import { SolidSwiper } from '../_shared/SolidSwiper'
import { DropArea } from '../_shared/DropArea'
import { LayoutType, MediaItem } from '../../pages/types'
import { useSnackbar } from '../../context/snackbar'

type Props = {
  shout: Shout
}
const AUTO_SAVE_INTERVAL = 5000
const handleScrollTopButtonClick = (e) => {
  e.preventDefault()
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const EMPTY_TOPIC: Topic = {
  id: -1,
  slug: ''
}

export const EditView = (props: Props) => {
  const { t } = useLocalize()
  const { user } = useSession()
  const [isScrolled, setIsScrolled] = createSignal(false)
  const [topics, setTopics] = createSignal<Topic[]>(null)
  const [coverImage, setCoverImage] = createSignal<string>(null)

  const { page } = useRouter()
  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const {
    form,
    formErrors,
    actions: { setForm, setFormErrors, saveDraft, saveDraftToLocalStorage, getDraftFromLocalStorage }
  } = useEditorContext()

  const shoutTopics = props.shout.topics || []

  setForm({
    shoutId: props.shout.id
  })

  const draft = getDraftFromLocalStorage()

  if (draft) {
    setForm(draft)
  } else {
    setForm({
      slug: props.shout.slug,
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

  const mediaItems: Accessor<MediaItem[]> = createMemo(() => {
    return JSON.parse(form.media || '[]')
  })

  onMount(async () => {
    const allTopics = await apiClient.getAllTopics()
    setTopics(allTopics)
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

  const handleTitleInputChange = (value) => {
    setForm('title', value)
    setForm('slug', slugify(value))
    if (value) {
      setFormErrors('title', '')
    }
  }

  const handleSlugInputChange = (e) => {
    const slug = e.currentTarget.value
    setForm('slug', slug)
  }

  const handleUploadModalContentCloseSetCover = (imgUrl: string) => {
    hideModal()
    setCoverImage(imageProxy(imgUrl))
    setForm('coverImageUrl', imgUrl)
  }
  const handleDeleteCoverImage = () => {
    setForm('coverImageUrl', '')
    setCoverImage(null)
  }

  const handleTopicSelectChange = (newSelectedTopics) => {
    if (newSelectedTopics.length === 0) {
      setForm('mainTopic', EMPTY_TOPIC)
    } else if (
      form.selectedTopics.length === 0 ||
      newSelectedTopics.every((topic) => topic.id !== form.mainTopic.id)
    ) {
      setForm('mainTopic', newSelectedTopics[0])
    }

    if (newSelectedTopics.length > 0) {
      setFormErrors('selectedTopics', '')
    }
    setForm('selectedTopics', newSelectedTopics)
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
      showSnackbar({ body: 'Automatically saving...' })
      if (props.shout.visibility === 'owner') {
        await saveDraft()
      } else {
        saveDraftToLocalStorage()
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
                <div
                  class={clsx(styles.edit, {
                    [styles.visible]: page().route === 'edit'
                  })}
                >
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
                </div>
                <div
                  class={clsx(styles.editSettings, {
                    [styles.visible]: page().route === 'editSettings'
                  })}
                >
                  <h1>{t('Publish Settings')}</h1>

                  <h4>Slug</h4>
                  <div class="pretty-form__item">
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      value={form.slug}
                      onChange={handleSlugInputChange}
                    />
                    <label for="slug">Slug</label>
                  </div>

                  {/*<h4>Лид</h4>*/}
                  {/*<div class="pretty-form__item">*/}
                  {/*  <textarea name="lead" id="lead" placeholder="Лид"></textarea>*/}
                  {/*  <label for="lead">Лид</label>*/}
                  {/*</div>*/}

                  {/*<h4>Выбор сообщества</h4>*/}
                  {/*<p class="description">Сообщества можно перечислить через запятую</p>*/}
                  {/*<div class="pretty-form__item">*/}
                  {/*  <input*/}
                  {/*    type="text"*/}
                  {/*    name="community"*/}
                  {/*    id="community"*/}
                  {/*    placeholder="Сообщества"*/}
                  {/*    class="nolabel"*/}
                  {/*  />*/}
                  {/*</div>*/}

                  <h4>{t('Topics')}</h4>
                  {/*<p class="description">*/}
                  {/*  Добавьте несколько тем, чтобы читатель знал, о&nbsp;чем ваш материал, и&nbsp;мог найти*/}
                  {/*  его на&nbsp;страницах интересных ему тем. Темы можно менять местами, первая тема*/}
                  {/*  становится заглавной*/}
                  {/*</p>*/}
                  <div class={styles.inputContainer}>
                    <div class={clsx('pretty-form__item', styles.topicSelectContainer)}>
                      <Show when={topics()}>
                        <TopicSelect
                          topics={topics()}
                          onChange={handleTopicSelectChange}
                          selectedTopics={form.selectedTopics}
                          onMainTopicChange={(mainTopic) => setForm('mainTopic', mainTopic)}
                          mainTopic={form.mainTopic}
                        />
                      </Show>
                    </div>
                    <Show when={formErrors.selectedTopics}>
                      <div class={styles.validationError}>{formErrors.selectedTopics}</div>
                    </Show>
                  </div>

                  {/*<h4>Соавторы</h4>*/}
                  {/*<p class="description">У каждого соавтора можно добавить роль</p>*/}
                  {/*<div class="pretty-form__item--with-button">*/}
                  {/*  <div class="pretty-form__item">*/}
                  {/*    <input type="text" name="authors" id="authors" placeholder="Введите имя или e-mail" />*/}
                  {/*    <label for="authors">Введите имя или e-mail</label>*/}
                  {/*  </div>*/}
                  {/*  <button class="button button--submit">Добавить</button>*/}
                  {/*</div>*/}

                  {/*<div class="row">*/}
                  {/*  <div class="col-md-6">Михаил Драбкин</div>*/}
                  {/*  <div class="col-md-6">*/}
                  {/*    <input type="text" name="coauthor" id="coauthor1" class="nolabel" />*/}
                  {/*  </div>*/}
                  {/*</div>*/}

                  <h4>{t('Material card')}</h4>
                  <p class="description">
                    {t(
                      'Choose a title image for the article. You can immediately see how the publication card will look like.'
                    )}
                  </p>
                  <div class={styles.articlePreview}>
                    <div class={styles.actions}>
                      <Button
                        variant="primary"
                        onClick={() => showModal('uploadCoverImage')}
                        value={coverImage() || form.coverImageUrl ? t('Add another image') : t('Add image')}
                      />
                      <Show when={coverImage() ?? form.coverImageUrl}>
                        <Button variant="secondary" onClick={handleDeleteCoverImage} value={t('Delete')} />
                      </Show>
                    </div>
                    <Show when={coverImage() ?? form.coverImageUrl}>
                      <div class={styles.shoutCardCoverContainer}>
                        <div class={styles.shoutCardCover}>
                          <img
                            src={coverImage() || imageProxy(form.coverImageUrl)}
                            alt={form.title}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </Show>
                    <div class={styles.shoutCardTitle}>{form.title}</div>
                    <div class={styles.shoutCardSubtitle}>{form.subtitle}</div>
                    <div class={styles.shoutAuthor}>{user().name}</div>
                  </div>
                </div>
              </div>
            </div>

            <Editor
              shoutId={form.shoutId}
              initialContent={form.body}
              onChange={(body) => setForm('body', body)}
            />
          </div>
        </form>
      </div>
      <Modal variant="narrow" name="uploadCoverImage">
        <UploadModalContent onClose={(value) => handleUploadModalContentCloseSetCover(value)} />
      </Modal>
      <Panel shoutId={props.shout.id} />
    </>
  )
}

export default EditView

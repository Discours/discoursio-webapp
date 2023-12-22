import { redirectPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { lazy, Show } from 'solid-js'
import { createStore } from 'solid-js/store'

import { ShoutForm, useEditorContext } from '../../../context/editor'
import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { UploadedFile } from '../../../pages/types'
import { router } from '../../../stores/router'
import { hideModal, showModal } from '../../../stores/ui'
import { useTopicsStore } from '../../../stores/zine/topics'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'
import { Image } from '../../_shared/Image'
import { TopicSelect, UploadModalContent } from '../../Editor'
import { Modal } from '../../Nav/Modal'
import { EMPTY_TOPIC } from '../Edit'

import styles from './PublishSettings.module.scss'
import stylesBeside from '../../Feed/Beside.module.scss'

const SimplifiedEditor = lazy(() => import('../../Editor/SimplifiedEditor'))
const GrowingTextarea = lazy(() => import('../../_shared/GrowingTextarea/GrowingTextarea'))
const DESCRIPTION_MAX_LENGTH = 400

type Props = {
  shoutId: number
  form: ShoutForm
}

const shorten = (str: string, maxLen: number) => {
  if (str.length <= maxLen) return str
  const result = str.slice(0, Math.max(0, str.lastIndexOf(' ', maxLen))).trim()
  return `${result}...`
}

export const PublishSettings = (props: Props) => {
  const { t } = useLocalize()
  const { author } = useSession()
  const { sortedTopics } = useTopicsStore()

  const composeDescription = () => {
    if (!props.form.description) {
      const cleanFootnotes = props.form.body.replaceAll(/<footnote data-value=".*?">.*?<\/footnote>/g, '')
      const leadText = cleanFootnotes.replaceAll(/<\/?[^>]+(>|$)/gi, ' ')
      return shorten(leadText, DESCRIPTION_MAX_LENGTH).trim()
    }
    return props.form.description
  }

  const initialData: Partial<ShoutForm> = {
    coverImageUrl: props.form.coverImageUrl,
    mainTopic: props.form.mainTopic || EMPTY_TOPIC,
    slug: props.form.slug,
    title: props.form.title,
    subtitle: props.form.subtitle,
    description: composeDescription(),
  }

  const {
    formErrors,
    actions: { setForm, setFormErrors, saveShout, publishShout },
  } = useEditorContext()

  const [settingsForm, setSettingsForm] = createStore(initialData)

  const handleUploadModalContentCloseSetCover = (image: UploadedFile) => {
    hideModal()
    setSettingsForm('coverImageUrl', image.url)
  }
  const handleDeleteCoverImage = () => {
    setSettingsForm('coverImageUrl', '')
  }

  const handleTopicSelectChange = (newSelectedTopics) => {
    if (
      props.form.selectedTopics.length === 0 ||
      newSelectedTopics.every((topic) => topic.id !== props.form.mainTopic.id)
    ) {
      setSettingsForm((prev) => {
        return {
          ...prev,
          mainTopic: newSelectedTopics[0],
        }
      })
    }

    if (newSelectedTopics.length > 0) {
      setFormErrors('selectedTopics', '')
    }
    setForm('selectedTopics', newSelectedTopics)
  }

  const handleBackClick = () => {
    redirectPage(router, 'edit', {
      shoutId: props.shoutId.toString(),
    })
  }
  const handleCancelClick = () => {
    setSettingsForm(initialData)
    handleBackClick()
  }
  const handlePublishSubmit = () => {
    publishShout({ ...props.form, ...settingsForm })
  }
  const handleSaveDraft = () => {
    saveShout({ ...props.form, ...settingsForm })
  }

  return (
    <form class={clsx(styles.PublishSettings, 'inputs-wrapper')}>
      <div class="wide-container">
        <div class="row">
          <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
            <div>
              <button type="button" class={styles.goBack} onClick={handleBackClick}>
                <Icon name="arrow-left" class={stylesBeside.icon} />
                {t('Back to editor')}
              </button>
            </div>
            <h1>{t('Publish Settings')}</h1>
            <h4>{t('Material card')}</h4>
            <div class={styles.articlePreview}>
              <div class={styles.actions}>
                <Button
                  variant="primary"
                  onClick={() => showModal('uploadCoverImage')}
                  value={settingsForm.coverImageUrl ? t('Add another image') : t('Add image')}
                />
                <Show when={settingsForm.coverImageUrl}>
                  <Button variant="secondary" onClick={handleDeleteCoverImage} value={t('Delete cover')} />
                </Show>
              </div>
              <div
                class={clsx(styles.shoutCardCoverContainer, {
                  [styles.hasImage]: settingsForm.coverImageUrl,
                })}
              >
                <Show when={settingsForm.coverImageUrl ?? initialData.coverImageUrl}>
                  <div class={styles.shoutCardCover}>
                    <Image src={settingsForm.coverImageUrl} alt={initialData.title} width={800} />
                  </div>
                </Show>
                <div class={styles.text}>
                  <Show when={settingsForm.mainTopic}>
                    <div class={styles.mainTopic}>{settingsForm.mainTopic.title}</div>
                  </Show>
                  <div class={styles.shoutCardTitle}>{settingsForm.title}</div>
                  <div class={styles.shoutCardSubtitle}>{settingsForm.subtitle}</div>
                  <div class={styles.shoutAuthor}>{author()?.name}</div>
                </div>
              </div>
            </div>
            <p class="description">
              {t(
                'Choose a title image for the article. You can immediately see how the publication card will look like.',
              )}
            </p>

            <div class={styles.commonSettings}>
              <GrowingTextarea
                class={styles.settingInput}
                variant="bordered"
                fieldName={t('Header')}
                placeholder={t('Come up with a title for your story')}
                initialValue={settingsForm.title}
                value={(value) => setSettingsForm('title', value)}
                allowEnterKey={false}
                maxLength={100}
              />
              <GrowingTextarea
                class={styles.settingInput}
                variant="bordered"
                fieldName={t('Subheader')}
                placeholder={t('Come up with a subtitle for your story')}
                initialValue={settingsForm.subtitle}
                value={(value) => setSettingsForm('subtitle', value)}
                allowEnterKey={false}
                maxLength={100}
              />
              <SimplifiedEditor
                variant="bordered"
                onlyBubbleControls={true}
                smallHeight={true}
                placeholder={t('Write a short introduction')}
                label={t('Description')}
                initialContent={composeDescription()}
                onChange={(value) => setForm('description', value)}
                maxLength={DESCRIPTION_MAX_LENGTH}
              />
            </div>

            <h4>{t('Slug')}</h4>
            <div class="pretty-form__item">
              <input type="text" name="slug" id="slug" value={settingsForm.slug} />
              <label for="slug">{t('Slug')}</label>
            </div>

            <h4>{t('Topics')}</h4>
            <p class="description">
              {t(
                'Add a few topics so that the reader knows what your content is about and can find it on pages of topics that interest them. Topics can be swapped, the first topic becomes the title',
              )}
            </p>
            <div class={styles.inputContainer}>
              <div class={clsx('pretty-form__item', styles.topicSelectContainer)}>
                <Show when={sortedTopics()}>
                  <TopicSelect
                    topics={sortedTopics()}
                    onChange={handleTopicSelectChange}
                    selectedTopics={props.form.selectedTopics}
                    onMainTopicChange={(mainTopic) => setForm('mainTopic', mainTopic)}
                    mainTopic={props.form.mainTopic}
                  />
                </Show>
              </div>
              <Show when={formErrors.selectedTopics}>
                <div class={styles.validationError}>{formErrors.selectedTopics}</div>
              </Show>
            </div>
            <h4>{t('Collaborators')}</h4>
            <Button
              variant="primary"
              onClick={() => showModal('inviteCoAuthors')}
              value={t('Invite collaborators')}
            />
          </div>
        </div>
      </div>

      <div class={styles.formActions}>
        <div class="wide-container">
          <div class="row">
            <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
              <div class={styles.content}>
                <Button
                  variant="light"
                  value={t('Cancel changes')}
                  class={styles.cancel}
                  onClick={handleCancelClick}
                />
                <Button variant="secondary" onClick={handleSaveDraft} value={t('Save draft')} />
                <Button onClick={handlePublishSubmit} variant="primary" value={t('Publish')} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal variant="narrow" name="uploadCoverImage">
        <UploadModalContent onClose={(value) => handleUploadModalContentCloseSetCover(value)} />
      </Modal>
    </form>
  )
}

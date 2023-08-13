import { clsx } from 'clsx'
import styles from './PublishSettings.module.scss'
import { createEffect, createSignal, onMount, Show } from 'solid-js'
import { TopicSelect, UploadModalContent } from '../../Editor'
import { Button } from '../../_shared/Button'
import { hideModal, showModal } from '../../../stores/ui'
import { imageProxy } from '../../../utils/imageProxy'
import { ShoutForm, useEditorContext } from '../../../context/editor'
import { useLocalize } from '../../../context/localize'
import { Modal } from '../../Nav/Modal'
import { Topic } from '../../../graphql/types.gen'
import { apiClient } from '../../../utils/apiClient'
import { EMPTY_TOPIC } from '../Edit'
import { useSession } from '../../../context/session'
import { Icon } from '../../_shared/Icon'
import stylesBeside from '../../Feed/Beside.module.scss'
import { redirectPage } from '@nanostores/router'
import { router } from '../../../stores/router'
import { GrowingTextarea } from '../../_shared/GrowingTextarea'
import { createStore } from 'solid-js/store'

type Props = {
  shoutId: number
  form: ShoutForm
}

const MAX_LEAD_LIMIT = 400
const shorten = (str: string, maxLen: number) => {
  if (str.length <= maxLen) return str
  const result = str.slice(0, Math.max(0, str.lastIndexOf(' ', maxLen))).trim()
  return `${result}...`
}

export const PublishSettings = (props: Props) => {
  const { t } = useLocalize()
  const { user } = useSession()

  const composeLead = () => {
    if (!props.form.lead) {
      const leadText = props.form.body.replaceAll(/<\/?[^>]+(>|$)/gi, ' ')
      return shorten(leadText, MAX_LEAD_LIMIT).trim()
    }
    return props.form.lead
  }

  const initialData: Partial<ShoutForm> = {
    coverImageUrl: props.form.coverImageUrl,
    mainTopic: props.form.mainTopic || EMPTY_TOPIC,
    slug: props.form.slug,
    title: props.form.title,
    subtitle: props.form.subtitle,
    lead: composeLead()
  }

  const {
    formErrors,
    actions: { setForm, setFormErrors, saveShout, publishShout }
  } = useEditorContext()

  const [settingsForm, setSettingsForm] = createStore(initialData)
  const [topics, setTopics] = createSignal<Topic[]>(null)

  const handleUploadModalContentCloseSetCover = (imgUrl: string) => {
    hideModal()
    setSettingsForm('coverImageUrl', imgUrl)
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
          mainTopic: newSelectedTopics[0]
        }
      })
    }

    if (newSelectedTopics.length > 0) {
      setFormErrors('selectedTopics', '')
    }
    setForm('selectedTopics', newSelectedTopics)
  }

  onMount(async () => {
    const allTopics = await apiClient.getAllTopics()
    setTopics(allTopics)
  })

  const handleBackClick = () => {
    redirectPage(router, 'edit', {
      shoutId: props.shoutId.toString()
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
    <div class={styles.PublishSettings}>
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
          class={clsx(styles.shoutCardCoverContainer, { [styles.hasImage]: settingsForm.coverImageUrl })}
        >
          <Show when={settingsForm.coverImageUrl ?? initialData.coverImageUrl}>
            <div class={styles.shoutCardCover}>
              <img src={imageProxy(settingsForm.coverImageUrl)} alt={initialData.title} loading="lazy" />
            </div>
          </Show>
          <div class={styles.text}>
            <Show when={settingsForm.mainTopic}>
              <div class={styles.mainTopic}>{settingsForm.mainTopic.title}</div>
            </Show>
            <div class={styles.shoutCardTitle}>{settingsForm.title}</div>
            <div class={styles.shoutCardSubtitle}>{settingsForm.subtitle}</div>
            <div class={styles.shoutAuthor}>{user().name}</div>
          </div>
        </div>
      </div>
      <p class="description">
        {t(
          'Choose a title image for the article. You can immediately see how the publication card will look like.'
        )}
      </p>

      <div class={styles.commonSettings}>
        <GrowingTextarea
          class={styles.settingInput}
          variant="bordered"
          placeholder={t('Come up with a title for your story')}
          initialValue={settingsForm.title}
          value={(value) => setSettingsForm('title', value)}
          allowEnterKey={false}
          maxLength={100}
        />
        <GrowingTextarea
          class={styles.settingInput}
          variant="bordered"
          placeholder={t('Come up with a subtitle for your story')}
          initialValue={settingsForm.subtitle}
          value={(value) => setSettingsForm('subtitle', value)}
          allowEnterKey={false}
          maxLength={100}
        />
        <GrowingTextarea
          class={styles.settingInput}
          variant="bordered"
          placeholder={t('Write a short introduction')}
          initialValue={`${settingsForm.lead}`}
          value={(value) => setSettingsForm('lead', value)}
          allowEnterKey={false}
          maxLength={MAX_LEAD_LIMIT}
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
          'Add a few topics so that the reader knows what your content is about and can find it on pages of topics that interest them. Topics can be swapped, the first topic becomes the title'
        )}
      </p>
      <div class={styles.inputContainer}>
        <div class={clsx('pretty-form__item', styles.topicSelectContainer)}>
          <Show when={topics()}>
            <TopicSelect
              topics={topics()}
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

      <div class={styles.formActions}>
        <Button
          variant="light"
          value={t('Cancel changes')}
          class={styles.cancel}
          onClick={handleCancelClick}
        />
        <Button variant="secondary" onClick={handleSaveDraft} value={t('Save draft')} />
        <Button onClick={handlePublishSubmit} variant="primary" value={t('Publish')} />
      </div>
      <Modal variant="narrow" name="uploadCoverImage">
        <UploadModalContent onClose={(value) => handleUploadModalContentCloseSetCover(value)} />
      </Modal>
    </div>
  )
}

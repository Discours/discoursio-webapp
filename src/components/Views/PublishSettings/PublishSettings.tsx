import { clsx } from 'clsx'
import styles from './PublishSettings.module.scss'
import { createSignal, onMount, Show } from 'solid-js'
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
import { getPagePath, redirectPage } from '@nanostores/router'
import { router } from '../../../stores/router'

type Props = {
  shoutId: number
  form: ShoutForm
}

export const PublishSettings = (props: Props) => {
  const { t } = useLocalize()
  const { user } = useSession()

  const initialData = {
    coverImageUrl: props.form.coverImageUrl,
    mainTopic: EMPTY_TOPIC,
    slug: props.form.slug
  }

  const {
    formErrors,
    actions: { setForm, setFormErrors }
  } = useEditorContext()

  const [coverImage, setCoverImage] = createSignal<string>(null)
  const [topics, setTopics] = createSignal<Topic[]>(null)
  const [settingsForm, setSettingsForm] = createSignal(initialData)

  const handleUploadModalContentCloseSetCover = (imgUrl: string) => {
    hideModal()
    setCoverImage(imageProxy(imgUrl))
    // setForm('coverImageUrl', imgUrl)
  }
  const handleDeleteCoverImage = () => {
    // setForm('coverImageUrl', '')
    setCoverImage(null)
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

  const handleSlugInputChange = () => {
    // const slug = e.currentTarget.value
    // setForm('slug', slug)
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
            value={coverImage() || props.form.coverImageUrl ? t('Add another image') : t('Add image')}
          />
          <Show when={coverImage() ?? props.form.coverImageUrl}>
            <Button variant="secondary" onClick={handleDeleteCoverImage} value={t('Delete')} />
          </Show>
        </div>
        <Show when={coverImage() ?? props.form.coverImageUrl}>
          <div class={styles.shoutCardCoverContainer}>
            <div class={styles.shoutCardCover}>
              <img
                src={coverImage() || imageProxy(props.form.coverImageUrl)}
                alt={props.form.title}
                loading="lazy"
              />
            </div>
          </div>
        </Show>
        <div class={styles.shoutCardTitle}>{props.form.title}</div>
        <div class={styles.shoutCardSubtitle}>{props.form.subtitle}</div>
        <div class={styles.shoutAuthor}>{user().name}</div>
      </div>
      <p class="description">
        {t(
          'Choose a title image for the article. You can immediately see how the publication card will look like.'
        )}
      </p>

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
        <Button variant="light" value={t('Cancel changes')} class={styles.cancel} />
        <Button variant="secondary" value={t('Save draft')} />
        <Button variant="primary" value={t('Publish')} />
      </div>
      <Modal variant="narrow" name="uploadCoverImage">
        <UploadModalContent onClose={(value) => handleUploadModalContentCloseSetCover(value)} />
      </Modal>
    </div>
  )
}

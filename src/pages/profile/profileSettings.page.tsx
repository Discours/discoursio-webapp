import { PageLayout } from '../../components/_shared/PageLayout'
import { Icon } from '../../components/_shared/Icon'
import ProfileSettingsNavigation from '../../components/Discours/ProfileSettingsNavigation'
import { For, createSignal, Show, onMount, onCleanup, createEffect } from 'solid-js'
import deepEqual from 'fast-deep-equal'
import { clsx } from 'clsx'
import styles from './Settings.module.scss'
import { useProfileForm } from '../../context/profile'
import { validateUrl } from '../../utils/validateUrl'
import { createFileUploader } from '@solid-primitives/upload'
import { useSession } from '../../context/session'
import FloatingPanel from '../../components/_shared/FloatingPanel/FloatingPanel'
import { useSnackbar } from '../../context/snackbar'
import { useLocalize } from '../../context/localize'
import { handleFileUpload } from '../../utils/handleFileUpload'
import { Userpic } from '../../components/Author/Userpic'
import { createStore } from 'solid-js/store'
import { clone } from '../../utils/clone'
import SimplifiedEditor from '../../components/Editor/SimplifiedEditor'
import { GrowingTextarea } from '../../components/_shared/GrowingTextarea'

export const ProfileSettingsPage = () => {
  const { t } = useLocalize()
  const [addLinkForm, setAddLinkForm] = createSignal<boolean>(false)
  const [incorrectUrl, setIncorrectUrl] = createSignal<boolean>(false)
  const [isUserpicUpdating, setIsUserpicUpdating] = createSignal(false)
  const [isFloatingPanelVisible, setIsFloatingPanelVisible] = createSignal(false)

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const {
    actions: { loadSession }
  } = useSession()

  const { form, updateFormField, submit, slugError } = useProfileForm()
  const [prevForm, setPrevForm] = createStore(clone(form))

  const handleChangeSocial = (value: string) => {
    if (validateUrl(value)) {
      updateFormField('links', value)
      setAddLinkForm(false)
    } else {
      setIncorrectUrl(true)
    }
  }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()
    try {
      await submit(form)
      setPrevForm(clone(form))
      showSnackbar({ body: t('Profile successfully saved') })
    } catch {
      showSnackbar({ type: 'error', body: t('Error') })
    }

    loadSession()
  }

  const { selectFiles } = createFileUploader({ multiple: false, accept: 'image/*' })

  const handleAvatarClick = async () => {
    await selectFiles(async ([uploadFile]) => {
      try {
        setIsUserpicUpdating(true)
        const result = await handleFileUpload(uploadFile)
        updateFormField('userpic', result.url)
        setIsUserpicUpdating(false)
        setIsFloatingPanelVisible(true)
      } catch (error) {
        console.error('[upload avatar] error', error)
      }
    })
  }

  const [hostname, setHostname] = createSignal<string | null>(null)

  onMount(() => {
    setHostname(window?.location.host)

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const handleBeforeUnload = (event) => {
      if (!deepEqual(form, prevForm)) {
        event.returnValue = t(
          'There are unsaved changes in your profile settings. Are you sure you want to leave the page without saving?'
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    onCleanup(() => window.removeEventListener('beforeunload', handleBeforeUnload))
  })

  const handleSaveProfile = () => {
    setIsFloatingPanelVisible(false)
    setPrevForm(clone(form))
  }

  createEffect(() => {
    if (!deepEqual(form, prevForm)) {
      setIsFloatingPanelVisible(true)
    }
  })

  return (
    <PageLayout>
      <Show when={form}>
        <div class="wide-container">
          <div class="row">
            <div class="col-md-5">
              <div class={clsx('left-navigation', styles.leftNavigation)}>
                <ProfileSettingsNavigation />
              </div>
            </div>
            <div class="col-md-19">
              <div class="row">
                <div class="col-md-20 col-lg-18 col-xl-16">
                  <h1>{t('Profile settings')}</h1>
                  <p class="description">{t('Here you can customize your profile the way you want.')}</p>
                  <form onSubmit={handleSubmit} enctype="multipart/form-data">
                    <h4>{t('Userpic')}</h4>
                    <div class="pretty-form__item">
                      <Userpic
                        name={form.name}
                        userpic={form.userpic}
                        isBig={true}
                        onClick={handleAvatarClick}
                        loading={isUserpicUpdating()}
                      />
                    </div>
                    <h4>{t('Name')}</h4>
                    <p class="description">
                      {t(
                        'Your name will appear on your profile page and as your signature in publications, comments and responses.'
                      )}
                    </p>
                    <div class="pretty-form__item">
                      <input
                        type="text"
                        name="username"
                        id="username"
                        placeholder={t('Name')}
                        onChange={(event) => updateFormField('name', event.currentTarget.value)}
                        value={form.name}
                      />
                      <label for="username">{t('Name')}</label>
                    </div>

                    <h4>{t('Address on Discourse')}</h4>
                    <div class="pretty-form__item">
                      <div class={styles.discoursName}>
                        <label for="user-address">https://{hostname()}/author/</label>
                        <div class={styles.discoursNameField}>
                          <input
                            type="text"
                            name="user-address"
                            id="user-address"
                            onChange={(event) => updateFormField('slug', event.currentTarget.value)}
                            value={form.slug}
                            class="nolabel"
                          />
                          <Show when={slugError()}>
                            <p class="form-message form-message--error">{t(`${slugError()}`)}</p>
                          </Show>
                        </div>
                      </div>
                    </div>

                    <h4>{t('Introduce')}</h4>
                    <GrowingTextarea
                      variant="bordered"
                      placeholder={t('Introduce')}
                      value={(value) => updateFormField('bio', value)}
                      initialValue={form.bio}
                      allowEnterKey={false}
                      maxLength={80}
                    />

                    <h4>{t('About myself')}</h4>
                    <SimplifiedEditor
                      variant="bordered"
                      onlyBubbleControls={true}
                      smallHeight={true}
                      placeholder={t('About myself')}
                      label={t('About myself')}
                      initialContent={form.about}
                      onChange={(value) => updateFormField('about', value)}
                      maxLength={500}
                    />
                    {/*Нет реализации полей на бэке*/}
                    {/*<h4>{t('How can I help/skills')}</h4>*/}
                    {/*<div class="pretty-form__item">*/}
                    {/*  <input type="text" name="skills" id="skills" />*/}
                    {/*</div>*/}
                    {/*<h4>{t('Where')}</h4>*/}
                    {/*<div class="pretty-form__item">*/}
                    {/*  <input type="text" name="location" id="location" placeholder="Откуда" />*/}
                    {/*  <label for="location">{t('Where')}</label>*/}
                    {/*</div>*/}

                    {/*<h4>{t('Date of Birth')}</h4>*/}
                    {/*<div class="pretty-form__item">*/}
                    {/*  <input*/}
                    {/*    type="date"*/}
                    {/*    name="birthdate"*/}
                    {/*    id="birthdate"*/}
                    {/*    placeholder="Дата рождения"*/}
                    {/*    class="nolabel"*/}
                    {/*  />*/}
                    {/*</div>*/}

                    <div class={clsx(styles.multipleControls, 'pretty-form__item')}>
                      <div class={styles.multipleControlsHeader}>
                        <h4>{t('Social networks')}</h4>
                        <button type="button" class="button" onClick={() => setAddLinkForm(!addLinkForm())}>
                          +
                        </button>
                      </div>
                      <Show when={addLinkForm()}>
                        <div class={styles.multipleControlsItem}>
                          <input
                            autofocus={true}
                            type="text"
                            name="link"
                            class="nolabel"
                            onChange={(event) => handleChangeSocial(event.currentTarget.value)}
                          />
                        </div>
                        <Show when={incorrectUrl()}>
                          <p class="form-message form-message--error">{t('It does not look like url')}</p>
                        </Show>
                      </Show>
                      <For each={form.links}>
                        {(link) => (
                          <div class={styles.multipleControlsItem}>
                            <input type="text" value={link} readonly={true} name="link" class="nolabel" />
                            <button type="button" onClick={() => updateFormField('links', link, true)}>
                              <Icon name="remove" class={styles.icon} />
                            </button>
                          </div>
                        )}
                      </For>
                    </div>
                    <br />
                    <FloatingPanel
                      isVisible={isFloatingPanelVisible()}
                      confirmTitle={t('Save settings')}
                      confirmAction={handleSaveProfile}
                      declineTitle={t('Cancel')}
                      declineAction={() => setIsFloatingPanelVisible(false)}
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </PageLayout>
  )
}

export const Page = ProfileSettingsPage

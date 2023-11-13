import { PageLayout } from '../../components/_shared/PageLayout'
import { ProfileSettingsNavigation } from '../../components/Nav/ProfileSettingsNavigation'
import { For, createSignal, Show, onMount, onCleanup, createEffect, Switch, Match } from 'solid-js'
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
import { createStore } from 'solid-js/store'
import { clone } from '../../utils/clone'
import SimplifiedEditor from '../../components/Editor/SimplifiedEditor'
import { GrowingTextarea } from '../../components/_shared/GrowingTextarea'
import { AuthGuard } from '../../components/AuthGuard'
import { handleImageUpload } from '../../utils/handleImageUpload'
import { SocialNetworkInput } from '../../components/_shared/SocialNetworkInput'
import { profileSocialLinks } from '../../utils/profileSocialLinks'
import { Icon } from '../../components/_shared/Icon'
import { Popover } from '../../components/_shared/Popover'
import { Image } from '../../components/_shared/Image'
import { Loading } from '../../components/_shared/Loading'
import { getImageUrl } from '../../utils/getImageUrl'

export const ProfileSettingsPage = () => {
  const { t } = useLocalize()
  const [addLinkForm, setAddLinkForm] = createSignal<boolean>(false)
  const [incorrectUrl, setIncorrectUrl] = createSignal<boolean>(false)

  const [isUserpicUpdating, setIsUserpicUpdating] = createSignal(false)
  const [uploadError, setUploadError] = createSignal(false)
  const [isFloatingPanelVisible, setIsFloatingPanelVisible] = createSignal(false)

  const {
    actions: { showSnackbar }
  } = useSnackbar()

  const {
    actions: { loadSession }
  } = useSession()

  const { form, updateFormField, submit, slugError } = useProfileForm()
  const [prevForm, setPrevForm] = createStore(clone(form))
  const [social, setSocial] = createSignal(form.links)
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

  const handleUploadAvatar = async () => {
    selectFiles(async ([uploadFile]) => {
      try {
        setUploadError(false)
        setIsUserpicUpdating(true)
        const result = await handleImageUpload(uploadFile)
        updateFormField('userpic', result.url)
        setIsUserpicUpdating(false)
        setIsFloatingPanelVisible(true)
      } catch (error) {
        setUploadError(true)
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

  const handleDeleteSocialLink = (link) => {
    updateFormField('links', link, true)
  }

  createEffect(() => {
    setSocial(form.links)
  })

  return (
    <PageLayout>
      <AuthGuard>
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
                        <div
                          class={clsx(styles.userpic, { [styles.hasControls]: form.userpic })}
                          onClick={!form.userpic && handleUploadAvatar}
                        >
                          <Switch>
                            <Match when={isUserpicUpdating()}>
                              <Loading />
                            </Match>
                            <Match when={form.userpic}>
                              <div
                                class={styles.userpicImage}
                                style={{
                                  'background-image': `url(${getImageUrl(form.userpic, {
                                    width: 180,
                                    height: 180
                                  })})`
                                }}
                              />
                              <div class={styles.controls}>
                                <Popover content={t('Delete userpic')}>
                                  {(triggerRef: (el) => void) => (
                                    <button
                                      ref={triggerRef}
                                      class={styles.control}
                                      onClick={() => updateFormField('userpic', '')}
                                    >
                                      <Icon name="close" />
                                    </button>
                                  )}
                                </Popover>
                                <Popover content={t('Upload userpic')}>
                                  {(triggerRef: (el) => void) => (
                                    <button
                                      ref={triggerRef}
                                      class={styles.control}
                                      onClick={handleUploadAvatar}
                                    >
                                      <Icon name="user-image-black" />
                                    </button>
                                  )}
                                </Popover>
                              </div>
                            </Match>
                            <Match when={!form.userpic}>
                              <Icon name="user-image-gray" />
                              {t('Here you can upload your photo')}
                            </Match>
                          </Switch>
                        </div>
                        <Show when={uploadError()}>
                          <div class={styles.error}>{t('Upload error')}</div>
                        </Show>
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
                        maxLength={120}
                      />

                      <h4>{t('About')}</h4>
                      <SimplifiedEditor
                        variant="bordered"
                        onlyBubbleControls={true}
                        smallHeight={true}
                        placeholder={t('About')}
                        label={t('About')}
                        initialContent={form.about}
                        onChange={(value) => updateFormField('about', value)}
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
                          <button
                            type="button"
                            class="button"
                            onClick={() => setAddLinkForm(!addLinkForm())}
                          >
                            +
                          </button>
                        </div>
                        <Show when={addLinkForm()}>
                          <SocialNetworkInput
                            isExist={false}
                            autofocus={true}
                            handleChange={(value) => handleChangeSocial(value)}
                          />
                          <Show when={incorrectUrl()}>
                            <p class="form-message form-message--error">{t('It does not look like url')}</p>
                          </Show>
                        </Show>
                        <For each={profileSocialLinks(social())}>
                          {(network) => (
                            <SocialNetworkInput
                              class={styles.socialInput}
                              link={network.link}
                              network={network.name}
                              handleChange={(value) => handleChangeSocial(value)}
                              isExist={!network.isPlaceholder}
                              slug={form.slug}
                              handleDelete={() => handleDeleteSocialLink(network.link)}
                            />
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
      </AuthGuard>
    </PageLayout>
  )
}

export const Page = ProfileSettingsPage

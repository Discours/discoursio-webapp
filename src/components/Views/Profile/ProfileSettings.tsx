import { UploadFile, createFileUploader } from '@solid-primitives/upload'
import { clsx } from 'clsx'
import deepEqual from 'fast-deep-equal'
import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  lazy,
  on,
  onCleanup,
  onMount
} from 'solid-js'
import { createStore } from 'solid-js/store'
import MiniEditor from '~/components/Editor/MiniEditor/MiniEditor'
import { useLocalize } from '~/context/localize'
import { useProfile } from '~/context/profile'
import { useSession } from '~/context/session'
import { useSnackbar, useUI } from '~/context/ui'
import { InputMaybe, ProfileInput } from '~/graphql/schema/core.gen'
import { getImageUrl } from '~/lib/getThumbUrl'
import { handleImageUpload } from '~/lib/handleImageUpload'
import { clone } from '~/utils/clone'
import { validateUrl } from '~/utils/validate'
import { ProfileSettingsNavigation } from '../../ProfileNav'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'
import { ImageCropper } from '../../_shared/ImageCropper'
import { Loading } from '../../_shared/Loading'
import { Modal } from '../../_shared/Modal'
import { Popover } from '../../_shared/Popover'
import { SocialNetworkInput } from '../../_shared/SocialNetworkInput'
import styles from './Settings.module.scss'
import { profileSocialLinks } from './profileSocialLinks'

// const SimplifiedEditor = lazy(() => import('~/components/Editor/SimplifiedEditor'))
const GrowingTextarea = lazy(() => import('~/components/_shared/GrowingTextarea/GrowingTextarea'))

function filterNulls(arr: InputMaybe<string>[]): string[] {
  return arr.filter((item): item is string => item !== null && item !== undefined)
}

export const ProfileSettings = () => {
  const { t } = useLocalize()
  const [isFormInitialized, setIsFormInitialized] = createSignal(false)
  const [isSaving, setIsSaving] = createSignal(false)
  const [social, setSocial] = createSignal<string[]>([])
  const [addLinkForm, setAddLinkForm] = createSignal<boolean>(false)
  const [incorrectUrl, setIncorrectUrl] = createSignal<boolean>(false)
  const [isUserpicUpdating, setIsUserpicUpdating] = createSignal(false)
  const [userpicFile, setUserpicFile] = createSignal<UploadFile>()
  const [uploadError, setUploadError] = createSignal(false)
  const [isFloatingPanelVisible, setIsFloatingPanelVisible] = createSignal(false)
  const [hostname, setHostname] = createSignal<string | null>(null)
  const [slugError, setSlugError] = createSignal<string>()
  const [nameError, setNameError] = createSignal<string>()
  const { form, submit, updateFormField, setForm } = useProfile()
  const [about, setAbout] = createSignal(form.about)
  const { showSnackbar } = useSnackbar()
  const { loadSession, session } = useSession()
  const [prevForm, setPrevForm] = createStore<ProfileInput>()
  const { showConfirm } = useUI()
  const { showModal, hideModal } = useUI()
  const [loading, setLoading] = createSignal(true)

  // Используем createEffect для отслеживания данных сессии и инициализации формы
  createEffect(() => {
    const s = session()
    if (s && !isFormInitialized()) {
      const profileData = s?.user?.app_data?.profile
      if (profileData) {
        setPrevForm(profileData)
        const soc: string[] = filterNulls(profileData.links || [])
        setSocial(soc)
        setForm(profileData) // Инициализируем форму с данными профиля
        setIsFormInitialized(true)
      }
      setLoading(false) // Отключаем загрузку только после инициализации данных
    }
  })

  let slugInputRef: HTMLInputElement | null
  let nameInputRef: HTMLInputElement | null

  const handleChangeSocial = (value: string) => {
    if (validateUrl(value)) {
      updateFormField('links', value)
      setAddLinkForm(false)
    } else {
      setIncorrectUrl(true)
    }
  }

  const handleSubmit = async (event: MouseEvent | undefined) => {
    event?.preventDefault()
    setIsSaving(true)
    if (nameInputRef?.value.length === 0) {
      setNameError(t('Required'))
      nameInputRef?.focus()
      setIsSaving(false)
      return
    }
    if (slugInputRef?.value.length === 0) {
      setSlugError(t('Required'))
      slugInputRef?.focus()
      setIsSaving(false)
      return
    }

    try {
      await submit(form)
      setPrevForm(clone(form))
      setAbout(form.about)
      showSnackbar({ body: t('Profile successfully saved') })
    } catch (error) {
      if (error?.toString().search('duplicate_slug')) {
        setSlugError(t('The address is already taken'))
        slugInputRef?.focus()
        return
      }
      showSnackbar({ type: 'error', body: t('Error') })
    } finally {
      setIsSaving(false)
    }

    setTimeout(loadSession, 5000) // renews author's profile
  }

  const handleCancel = async () => {
    const isConfirmed = await showConfirm({
      confirmBody: t('Do you really want to reset all changes?'),
      confirmButtonVariant: 'primary',
      declineButtonVariant: 'secondary'
    })
    isConfirmed && setForm(clone(prevForm))
  }

  const handleCropAvatar = () => {
    const { selectFiles } = createFileUploader({ multiple: false, accept: 'image/*' })

    selectFiles(([uploadFile]) => {
      setUserpicFile(uploadFile as UploadFile)

      showModal('cropImage')
    })
  }

  const handleUploadAvatar = async (uploadFile: UploadFile) => {
    try {
      setUploadError(false)
      setIsUserpicUpdating(true)

      const result = await handleImageUpload(uploadFile, session()?.access_token || '')
      updateFormField('pic', result.url)

      setUserpicFile(undefined)
      setIsUserpicUpdating(false)
    } catch (error) {
      setUploadError(true)
      console.error('[upload avatar] error', error)
    }
  }

  onMount(() => {
    setHostname(window?.location.host)

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!deepEqual(form, prevForm)) {
        event.returnValue = t(
          'There are unsaved changes in your profile settings. Are you sure you want to leave the page without saving?'
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    onCleanup(() => window.removeEventListener('beforeunload', handleBeforeUnload))
  })

  createEffect(
    on(
      () => deepEqual(form, prevForm),
      () => {
        if (Object.keys(prevForm).length > 0) {
          setIsFloatingPanelVisible(!deepEqual(form, prevForm))
        }
      }
    )
  )

  const handleDeleteSocialLink = (link: string) => {
    updateFormField('links', link, true)
  }

  const slugUpdate = (ev: InputEvent) => {
    const input = (ev.target || ev.currentTarget) as HTMLInputElement
    const value = input.value
    const newValue = value.startsWith('@') || value.startsWith('!') ? value.substring(1) : value
    input.value = newValue
    updateFormField('slug', newValue)
  }

  return (
    <Show when={Object.keys(form).length > 0 && isFormInitialized() && !loading()} fallback={<Loading />}>
      <>
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
                  <form enctype="multipart/form-data" autocomplete="off">
                    <h4>{t('Userpic')}</h4>
                    <div class="pretty-form__item">
                      <div
                        class={clsx(styles.userpic, { [styles.hasControls]: form.pic })}
                        onClick={handleCropAvatar}
                      >
                        <Switch>
                          <Match when={isUserpicUpdating()}>
                            <Loading />
                          </Match>
                          <Match when={form.pic}>
                            <div
                              class={styles.userpicImage}
                              style={{
                                'background-image': `url(${getImageUrl(form.pic || '', {
                                  width: 180,
                                  height: 180
                                })})`
                              }}
                            />
                            <div class={styles.controls}>
                              <Popover content={t('Delete userpic')}>
                                {(triggerRef: (el: HTMLElement) => void) => (
                                  <button
                                    ref={triggerRef}
                                    class={styles.control}
                                    onClick={() => updateFormField('pic', '')}
                                  >
                                    <Icon name="close" />
                                  </button>
                                )}
                              </Popover>

                              {/* @@TODO inspect popover below. onClick causes page refreshing */}
                              <Popover content={t('Upload userpic')}>
                                {(triggerRef: (el: HTMLElement) => void) => (
                                  <button
                                    ref={triggerRef}
                                    class={styles.control}
                                    onClick={() => handleCropAvatar()}
                                  >
                                    <Icon name="user-image-black" />
                                  </button>
                                )}
                              </Popover>
                            </div>
                          </Match>
                          <Match when={!form.pic}>
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
                      <label for="nameOfUser">
                        <input
                          type="text"
                          name="nameOfUser"
                          id="nameOfUser"
                          data-lpignore="true"
                          autocomplete="one-time-code"
                          placeholder={t('Name')}
                          onInput={(event) => updateFormField('name', event.currentTarget.value)}
                          value={form.name || ''}
                          ref={(el) => (nameInputRef = el)}
                        />
                        {t('Name')}
                      </label>
                      <Show when={nameError()}>
                        <div
                          style={{ position: 'absolute', 'margin-top': '-4px' }}
                          class="form-message form-message--error"
                        >
                          {t(`${nameError()}`)}
                        </div>
                      </Show>
                    </div>

                    <h4>{t('Address on Discours')}</h4>
                    <div class="pretty-form__item">
                      <div class={styles.discoursName}>
                        <label for="user-address">{hostname()}/@</label>
                        <div class={styles.discoursNameField}>
                          <input
                            type="text"
                            name="user-address"
                            id="user-address"
                            data-lpignore="true"
                            autocomplete="one-time-code2"
                            onInput={slugUpdate}
                            value={form.slug || ''}
                            ref={(el) => (slugInputRef = el)}
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
                      initialValue={form.bio || ''}
                      allowEnterKey={false}
                      maxLength={120}
                    />

                    <h4>{t('About')}</h4>
                    <SimplifiedEditor
                      resetToInitial={clearAbout()}
                      noLimits={true}
                      variant="bordered"
                      onlyBubbleControls={true}
                      smallHeight={true}
                      placeholder={t('About')}
                      label={t('About')}
                      initialContent={form.about || ''}
                      autoFocus={false}
                      onChange={(value) => updateFormField('about', value)}
                      placeholder={t('About')}
                    />
                    <div class={clsx(styles.multipleControls, 'pretty-form__item')}>
                      <div class={styles.multipleControlsHeader}>
                        <h4>{t('Social networks')}</h4>
                        <button type="button" class="button" onClick={() => setAddLinkForm(!addLinkForm())}>
                          +
                        </button>
                      </div>
                      <Show when={addLinkForm()}>
                        <SocialNetworkInput
                          isExist={false}
                          autofocus={true}
                          handleInput={(value) => handleChangeSocial(value)}
                        />
                        <Show when={incorrectUrl()}>
                          <p class="form-message form-message--error">{t('It does not look like url')}</p>
                        </Show>
                      </Show>
                      <Show when={social()}>
                        <For each={profileSocialLinks(social())}>
                          {(network) => (
                            <SocialNetworkInput
                              class={styles.socialInput}
                              link={network.link}
                              network={network.name}
                              handleInput={(value) => handleChangeSocial(value)}
                              isExist={!network.isPlaceholder}
                              slug={form.slug || ''}
                              handleDelete={() => handleDeleteSocialLink(network.link)}
                            />
                          )}
                        </For>
                      </Show>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Show when={isFloatingPanelVisible()}>
          <div class={styles.formActions}>
            <div class="wide-container">
              <div class="row">
                <div class="col-md-19 offset-md-5">
                  <div class="row">
                    <div class="col-md-20 col-lg-18 col-xl-16">
                      <div class={styles.content}>
                        <Button
                          class={styles.cancel}
                          variant="light"
                          value={
                            <>
                              <span class={styles.cancelLabel}>{t('Cancel changes')}</span>
                              <span class={styles.cancelLabelMobile}>{t('Cancel')}</span>
                            </>
                          }
                          onClick={handleCancel}
                        />
                        <Button
                          onClick={handleSubmit}
                          variant="primary"
                          disabled={isSaving()}
                          value={isSaving() ? t('Saving...') : t('Save settings')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>
        <Modal variant="medium" name="cropImage" onClose={() => setUserpicFile(undefined)}>
          <h2>{t('Crop image')}</h2>

          <Show when={Boolean(userpicFile())}>
            <ImageCropper
              uploadFile={userpicFile() as UploadFile}
              onSave={(data) => {
                handleUploadAvatar(data)

                hideModal()
              }}
              onDecline={() => hideModal()}
            />
          </Show>
        </Modal>
      </>
    </Show>
  )
}

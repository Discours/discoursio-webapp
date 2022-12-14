import { PageWrap } from '../../_shared/PageWrap'
import { t } from '../../../utils/intl'
import type { PageProps } from '../../types'
import { Icon } from '../../_shared/Icon'
import ProfileSettingsNavigation from '../../Discours/ProfileSettingsNavigation'
import { For, createSignal, Show, onMount } from 'solid-js'
import { clsx } from 'clsx'
import styles from './Settings.module.scss'
import { useProfileForm } from '../../../context/profile'
import { createFileUploader } from '@solid-primitives/upload'
import validateUrl from '../../../utils/validateUrl'

export const ProfileSettingsPage = (props: PageProps) => {
  const [addLinkForm, setAddLinkForm] = createSignal<boolean>(false)
  const [incorrectUrl, setIncorrectUrl] = createSignal<boolean>(false)
  const { form, updateFormField, submit, slugError } = useProfileForm()
  const handleChangeSocial = (value) => {
    if (validateUrl(value)) {
      updateFormField('links', value)
      setAddLinkForm(false)
    } else {
      setIncorrectUrl(true)
    }
  }
  const handleSubmit = (event: Event): void => {
    event.preventDefault()
    submit(form)
  }

  const { files, selectFiles: selectFilesAsync } = createFileUploader({ accept: 'image/*' })

  const handleUpload = () => {
    selectFilesAsync(async ([{ source, name, size, file }]) => {
      const image = { source, name, size, file }
      try {
        const formData = new FormData()
        formData.append('type', file.type)
        formData.append('name', image.source.split('/').pop())
        formData.append('ext', image.name.split('.').pop())
        const resp = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const url = await resp.json()
        updateFormField('userpic', url)
      } catch (error) {
        console.error('[upload] error', error)
      }
    })
  }
  const [hostname, setHostname] = createSignal('new.discours.io')
  onMount(() => setHostname(window?.location.host))

  return (
    <PageWrap>
      <Show when={form}>
        <div class="wide-container">
          <div class="shift-content">
            <div class="left-col">
              <div class={clsx('left-navigation', styles.leftNavigation)}>
                <ProfileSettingsNavigation />
              </div>
            </div>
            <div class="row">
              <div class="col-md-10 col-lg-9 col-xl-8">
                <h1>{t('Profile settings')}</h1>
                <p class="description">{t('Here you can customize your profile the way you want.')}</p>
                <form onSubmit={handleSubmit}>
                  <h4>{t('Userpic')}</h4>
                  <div class="pretty-form__item">
                    <div class={styles.avatarContainer}>
                      <img class={styles.avatar} src={form.userpic} alt={form.name} />
                      <input type="button" class={styles.avatarInput} onClick={handleUpload} />
                    </div>
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
                        <p class="form-message form-message--error">{t(`${slugError()}`)}</p>
                      </div>
                    </div>
                  </div>

                  <h4>{t('Introduce')}</h4>
                  <div class="pretty-form__item">
                    <textarea name="presentation" id="presentation" placeholder={t('Introduce')}>
                      {form.bio}
                    </textarea>
                    <label for="presentation">{t('Introduce')}</label>
                  </div>

                  <h4>{t('About myself')}</h4>
                  <div class="pretty-form__item">
                    <textarea
                      name="about"
                      id="about"
                      placeholder={t('About myself')}
                      value={form.about}
                      onChange={(event) => updateFormField('about', event.currentTarget.value)}
                    />
                    <label for="about">{t('About myself')}</label>
                  </div>

                  {/*?????? ???????????????????? ?????????? ???? ????????*/}
                  {/*<h4>{t('How can I help/skills')}</h4>*/}
                  {/*<div class="pretty-form__item">*/}
                  {/*  <input type="text" name="skills" id="skills" />*/}
                  {/*</div>*/}
                  {/*<h4>{t('Where')}</h4>*/}
                  {/*<div class="pretty-form__item">*/}
                  {/*  <input type="text" name="location" id="location" placeholder="????????????" />*/}
                  {/*  <label for="location">{t('Where')}</label>*/}
                  {/*</div>*/}

                  {/*<h4>{t('Date of Birth')}</h4>*/}
                  {/*<div class="pretty-form__item">*/}
                  {/*  <input*/}
                  {/*    type="date"*/}
                  {/*    name="birthdate"*/}
                  {/*    id="birthdate"*/}
                  {/*    placeholder="???????? ????????????????"*/}
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
                  <p>
                    <button type="submit" class="button button--submit">
                      {t('Save settings')}
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default ProfileSettingsPage

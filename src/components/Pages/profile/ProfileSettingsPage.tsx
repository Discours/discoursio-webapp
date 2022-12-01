import { PageWrap } from '../../_shared/PageWrap'
import { t } from '../../../utils/intl'
import type { PageProps } from '../../types'
import { Icon } from '../../_shared/Icon'
import ProfileSettingsNavigation from '../../Discours/ProfileSettingsNavigation'
import { useSession } from '../../../context/session'
import { createMemo, For, createSignal, Show, createEffect } from 'solid-js'
import { loadAuthor, useAuthorsStore } from '../../../stores/zine/authors'
import type { Author } from '../../../graphql/types.gen'
import { clsx } from 'clsx'
import styles from './Settings.module.scss'

export const ProfileSettingsPage = (props: PageProps) => {
  const [author, setAuthor] = createSignal<Author>(null)
  const { session } = useSession()
  const currentSlug = createMemo(() => session()?.user?.slug)
  const { authorEntities } = useAuthorsStore({ authors: [] })
  const currentAuthor = createMemo(() => authorEntities()[currentSlug()])

  createEffect(async () => {
    if (!currentSlug()) return
    try {
      await loadAuthor({ slug: currentSlug() })
      setAuthor(currentAuthor())
      console.log('!!! currentAuthor:', currentAuthor())
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <PageWrap>
      <Show when={author()}>
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
                <form>
                  <h4>{t('Userpic')}</h4>
                  <div class="pretty-form__item">
                    <div class={styles.avatarContainer}>
                      <img class={styles.avatar} src={author().userpic} />
                      <input
                        type="file"
                        name="avatar"
                        class={styles.avatarInput}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                      />
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
                      placeholder="Имя"
                      value={author().name}
                    />
                    <label for="username">Имя</label>
                  </div>

                  <h4>{t('Address on Discourse')}</h4>
                  <div class="pretty-form__item">
                    <div class={styles.discoursName}>
                      <label for="user-address">https://discours.io/user/</label>
                      <div class={styles.discoursNameField}>
                        <input
                          type="text"
                          name="user-address"
                          id="user-address"
                          value={currentSlug()}
                          class="nolabel"
                        />
                        <p class="form-message form-message--error">
                          {t('Sorry, this address is already taken, please choose another one.')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h4>{t('Introduce')}</h4>
                  <div class="pretty-form__item">
                    <textarea name="presentation" id="presentation" placeholder="Представление" />
                    <label for="presentation">{t('Introduce')}</label>
                  </div>

                  <h4>{t('About myself')}</h4>
                  <div class="pretty-form__item">
                    <textarea name="about" id="about" placeholder="О себе">
                      {author().bio}
                    </textarea>
                    <label for="about">{t('About myself')}</label>
                  </div>

                  <h4>{t('How can I help/skills')}</h4>
                  <div class="pretty-form__item">
                    <input type="text" name="skills" id="skills" />
                  </div>

                  <h4>{t('Where')}</h4>
                  <div class="pretty-form__item">
                    <input type="text" name="location" id="location" placeholder="Откуда" />
                    <label for="location">{t('Where')}</label>
                  </div>

                  <h4>{t('Date of Birth')}</h4>
                  <div class="pretty-form__item">
                    <input
                      type="date"
                      name="birthdate"
                      id="birthdate"
                      placeholder="Дата рождения"
                      class="nolabel"
                    />
                  </div>

                  <div class={clsx(styles.multipleControls, 'pretty-form__item')}>
                    <div class={styles.multipleControlsHeader}>
                      <h4>{t('Social networks')}</h4>
                      <button class="button">+</button>
                    </div>
                    <For each={author().links}>
                      {(link) => (
                        <div class={styles.multipleControlsItem}>
                          <input type="text" value={link} name="social1" class="nolabel" />
                          <button>
                            <Icon name="remove" class={styles.icon} />
                          </button>
                        </div>
                      )}
                    </For>
                  </div>

                  <br />
                  <p>
                    <button class="button button--submit">{t('Save settings')}</button>
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

import { PageWrap } from '../../_shared/PageWrap'
import type { PageProps } from '../../types'
import { createSignal, onMount, Show } from 'solid-js'
import { Loading } from '../../Loading'
import styles from './Settings.module.scss'
import { Icon } from '../../_shared/Icon'
import { clsx } from 'clsx'

export const ProfileSettingsPage = (props: PageProps) => {
  return (
    <PageWrap>
      <div class="wide-container">
        <div class="shift-content">
          <div class="left-col">
            <div class="left-navigation">zhopa</div>
          </div>

          <div class="row">
            <div class="col-md-10 col-lg-9 col-xl-8">
              <h1>Настройки профиля</h1>
              <p class="description">Здесь можно настроить свой профиль так, как вы хотите.</p>

              <form>
                <h4>Аватар</h4>
                <div class="pretty-form__item">
                  <div class={styles.avatarContainer}>
                    <img class={styles.avatar} />
                    <input
                      type="file"
                      name="avatar"
                      class={styles.avatarInput}
                      accept="image/jpeg,image/png,image/gif,image/webp"
                    />
                  </div>
                </div>

                <h4>Имя</h4>
                <p class="description">
                  Ваше имя появится на&nbsp;странице вашего профиля и&nbsp;как ваша подпись
                  в&nbsp;публикациях, комментариях и&nbsp;откликах
                </p>
                <div class="pretty-form__item">
                  <input type="text" name="username" id="username" placeholder="Имя" />
                  <label for="username">Имя</label>
                </div>

                <h4>Адрес на&nbsp;Дискурсе</h4>
                <div class="pretty-form__item">
                  <div class={styles.discoursName}>
                    <label for="user-address">https://discours.io/user/</label>
                    <div class={styles.discoursNameField}>
                      <input type="text" name="user-address" id="user-address" class="nolabel" />
                      <p class="form-message form-message--error">
                        Увы, этот адрес уже занят, выберите другой
                      </p>
                    </div>
                  </div>
                </div>

                <h4>Представление</h4>
                <div class="pretty-form__item">
                  <textarea name="presentation" id="presentation" placeholder="Представление"></textarea>
                  <label for="presentation">Представление</label>
                </div>

                <h4>О себе</h4>
                <div class="pretty-form__item">
                  <textarea name="about" id="about" placeholder="О себе"></textarea>
                  <label for="about">О себе</label>
                </div>

                <h4>Чем могу помочь/навыки</h4>
                <div class="pretty-form__item">
                  <input type="text" name="skills" id="skills" />
                </div>

                <h4>Откуда</h4>
                <div class="pretty-form__item">
                  <input type="text" name="location" id="location" placeholder="Откуда" />
                  <label for="location">Откуда</label>
                </div>

                <h4>Дата рождения</h4>
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
                    <h4>Социальные сети</h4>
                    <button class="button">+</button>
                  </div>
                  <div class={styles.multipleControlsItem}>
                    <input type="text" name="social1" class="nolabel" />
                    <button>
                      <Icon name="remove" class={styles.icon} />
                    </button>
                  </div>
                  <div class={styles.multipleControlsItem}>
                    <input type="text" name="social1" class="nolabel" />
                    <button>
                      <Icon name="remove" class={styles.icon} />
                    </button>
                  </div>
                </div>

                <br />
                <p>
                  <button class="button button--submit">Сохранить настройки</button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}

// for lazy loading
export default ProfileSettingsPage

import { lazy, Suspense } from 'solid-js'
import { Loading } from '../_shared/Loading'
import { useLocalize } from '../../context/localize'
import { clsx } from 'clsx'
import styles from './Create.module.scss'

const Editor = lazy(() => import('../Editor/Editor'))

export const CreateView = () => {
  const { t } = useLocalize()

  return (
    <Suspense fallback={<Loading />}>
      <form>
        <div class="wide-container">
          <div class="shift-content">
            <div class="row">
              <div class="col-md-10 col-lg-9 col-xl-8">
                <h4>Заголовок</h4>
                <div class="pretty-form__item">
                  <input
                    type="text"
                    name="header"
                    id="header"
                    placeholder="Придумайте заголовок вашей истории"
                  />
                  <label for="header">Придумайте заголовок вашей истории</label>
                </div>

                <h4>Подзаголовок</h4>
                <div class="pretty-form__item">
                  <input type="text" name="subheader" id="subheader" placeholder="Подзаголовок" />
                  <label for="subheader">Подзаголовок</label>
                </div>

                <Editor />

                <h1>Настройки публикации</h1>
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

                <h4>Темы</h4>
                <p class="description">
                  Добавьте несколько тем, чтобы читатель знал, о&nbsp;чем ваш материал, и&nbsp;мог найти его
                  на&nbsp;страницах интересных ему тем. Темы можно менять местами, первая тема становится
                  заглавной
                </p>
                <div class="pretty-form__item">
                  <input type="text" name="topics" id="topics" placeholder="Темы" class="nolabel" />
                </div>

                <h4>Соавторы</h4>
                <p class="description">У каждого соавтора можно добавить роль</p>
                <div class="pretty-form__item--with-button">
                  <div class="pretty-form__item">
                    <input type="text" name="authors" id="authors" placeholder="Введите имя или e-mail" />
                    <label for="authors">Введите имя или e-mail</label>
                  </div>
                  <button class="button button--submit">Добавить</button>
                </div>

                <div class="row">
                  <div class="col-md-6">Михаил Драбкин</div>
                  <div class="col-md-6">
                    <input type="text" name="coauthor" id="coauthor1" class="nolabel" />
                  </div>
                </div>

                <h4>Карточка материала на&nbsp;главной</h4>
                <p class="description">
                  Выберите заглавное изображение для статьи, тут сразу можно увидеть как карточка будет
                  выглядеть на&nbsp;главной странице
                </p>
                <div class={styles.articlePreview}></div>

                <div class={styles.saveBlock}>
                  <p>
                    Проверьте ещё раз введённые данные, если всё верно, вы&nbsp;можете сохранить или
                    опубликовать ваш текст
                  </p>
                  <button class={clsx('button button--outline', styles.button)}>Сохранить</button>
                  <button class={clsx('button button--submit', styles.button)}>Опубликовать</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Suspense>
  )
}

export default CreateView

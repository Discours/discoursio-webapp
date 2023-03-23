import { createSignal, lazy, onMount, Show, Suspense } from 'solid-js'
import { Loading } from '../_shared/Loading'
import { useLocalize } from '../../context/localize'
import { clsx } from 'clsx'
import styles from './Create.module.scss'
import { Title } from '@solidjs/meta'
import { createStore } from 'solid-js/store'
import type { ShoutInput, Topic } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { TopicSelect } from '../Editor/TopicSelect/TopicSelect'

const Editor = lazy(() => import('../Editor/Editor'))

type ShoutForm = {
  slug: string
  title: string
  subtitle: string
  selectedTopics: Topic[]
  mainTopic: Topic
  body: string
  coverImageUrl: string
}

export const CreateView = () => {
  const { t } = useLocalize()

  const [topics, setTopics] = createSignal<Topic[]>(null)

  const [form, setForm] = createStore<ShoutForm>({
    slug: '',
    title: '',
    subtitle: '',
    selectedTopics: [],
    mainTopic: null,
    body: '',
    coverImageUrl: ''
  })

  onMount(async () => {
    const allTopics = await apiClient.getAllTopics()
    setTopics(allTopics)
  })

  const handleFormSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <>
      <Title>{t('Write an article')}</Title>
      <Suspense fallback={<Loading />}>
        <form onSubmit={handleFormSubmit}>
          <div class="wide-container">
            <div class="shift-content">
              <div class="row">
                <div class="col-md-10 col-lg-9 col-xl-8">
                  <h4>Slug</h4>
                  <div class="pretty-form__item">
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      value={form.slug}
                      onChange={(e) => setForm('slug', e.currentTarget.value)}
                    />
                    <label for="slug">Slug</label>
                  </div>

                  <h4>Заголовок</h4>
                  <div class="pretty-form__item">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      placeholder="Придумайте заголовок вашей истории"
                      value={form.title}
                      onChange={(e) => setForm('title', e.currentTarget.value)}
                    />
                    <label for="title">Придумайте заголовок вашей истории</label>
                  </div>

                  <h4>Подзаголовок</h4>
                  <div class="pretty-form__item">
                    <input
                      type="text"
                      name="subtitle"
                      id="subtitle"
                      placeholder="Подзаголовок"
                      value={form.subtitle}
                      onChange={(e) => setForm('subtitle', e.currentTarget.value)}
                    />
                    <label for="subtitle">Подзаголовок</label>
                  </div>

                  <Editor onChange={(body) => setForm('body', body)} />

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
                  {/*<p class="description">*/}
                  {/*  Добавьте несколько тем, чтобы читатель знал, о&nbsp;чем ваш материал, и&nbsp;мог найти*/}
                  {/*  его на&nbsp;страницах интересных ему тем. Темы можно менять местами, первая тема*/}
                  {/*  становится заглавной*/}
                  {/*</p>*/}
                  <div class="pretty-form__item">
                    <Show when={topics()}>
                      <TopicSelect
                        topics={topics()}
                        onChange={(newSelectedTopics) => setForm('selectedTopics', newSelectedTopics)}
                        selectedTopics={form.selectedTopics}
                      />
                    </Show>
                    {/*<input type="text" name="topics" id="topics" placeholder="Темы" class="nolabel" />*/}
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
                    {/*<button class={clsx('button button--outline', styles.button)}>Сохранить</button>*/}
                    <button type="submit" class={clsx('button button--submit', styles.button)}>
                      Опубликовать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Suspense>
    </>
  )
}

export default CreateView

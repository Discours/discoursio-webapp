import { createSignal, lazy, onMount, Show, Suspense } from 'solid-js'
import { Loading } from '../_shared/Loading'
import { useLocalize } from '../../context/localize'
import { clsx } from 'clsx'
import styles from './Create.module.scss'
import { Title } from '@solidjs/meta'
import { createStore } from 'solid-js/store'
import type { Topic } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { TopicSelect } from '../Editor/TopicSelect/TopicSelect'
import { router, useRouter } from '../../stores/router'
import { getPagePath } from '@nanostores/router'
import { translit } from '../../utils/ru2en'
import { Editor } from '../Editor/Editor'
import { Button } from '../_shared/Button'
import { Icon } from '../_shared/Icon'

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
  const { page } = useRouter()

  const [isSlugChanged, setIsSlugChanged] = createSignal(false)
  const [isEditorPanelOPened, setIsEditorPanelOPened] = createSignal(false)

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

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    const newShout = await apiClient.createArticle({
      article: {
        slug: form.slug,
        title: form.title,
        subtitle: form.subtitle,
        body: form.body,
        topics: form.selectedTopics.map((topic) => topic.slug),
        mainTopic: form.selectedTopics[0].slug
      }
    })

    router.open(getPagePath(router, 'article', { slug: newShout.slug }))
  }

  const handleTitleInputChange = (e) => {
    const title = e.currentTarget.value
    setForm('title', title)

    if (!isSlugChanged()) {
      const slug = translit(title).replaceAll(' ', '-')
      setForm('slug', slug)
    }
  }

  const handleSlugInputChange = (e) => {
    const slug = e.currentTarget.value

    if (slug !== form.slug) {
      setIsSlugChanged(true)
    }
    setForm('slug', slug)
  }

  const toggleEditorPanel = () => {
    setIsEditorPanelOPened(!isEditorPanelOPened())
  }

  return (
    <>
      <div class={styles.container}>
        <Title>{t('Write an article')}</Title>

        <form onSubmit={handleFormSubmit}>
          <div class="wide-container">
            <div class="row">
              <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
                <div
                  class={clsx(styles.create, {
                    [styles.visible]: page().route === 'create'
                  })}
                >
                  <input
                    class={styles.titleInput}
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Заголовок"
                    value={form.title}
                    onChange={handleTitleInputChange}
                  />

                  <input
                    class={styles.subtitleInput}
                    type="text"
                    name="subtitle"
                    id="subtitle"
                    placeholder="Подзаголовок"
                    value={form.subtitle}
                    onChange={(e) => setForm('subtitle', e.currentTarget.value)}
                  />

                  <Editor shoutId={42} onChange={(body) => setForm('body', body)} />

                  <div class={styles.saveBlock}>
                    {/*<button class={clsx('button button--outline', styles.button)}>Сохранить</button>*/}
                    <a href={getPagePath(router, 'createSettings')}>Настройки</a>
                  </div>
                </div>
                <div
                  class={clsx(styles.createSettings, {
                    [styles.visible]: page().route === 'createSettings'
                  })}
                >
                  <h1>Настройки публикации</h1>

                  <h4>Slug</h4>
                  <div class="pretty-form__item">
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      value={form.slug}
                      onChange={handleSlugInputChange}
                    />
                    <label for="slug">Slug</label>
                  </div>

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
                  <div class={styles.articlePreview} />

                  <div class={styles.saveBlock}>
                    <p>
                      Проверьте ещё раз введённые данные, если всё верно, вы&nbsp;можете сохранить или
                      опубликовать ваш текст
                    </p>
                    {/*<button class={clsx('button button--outline', styles.button)}>Сохранить</button>*/}
                    <a href={getPagePath(router, 'create')}>Назад</a>
                    <button type="submit" class={clsx('button button--submit', styles.button)}>
                      Опубликовать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <aside
        class={clsx('col-md-6', styles.asidePanel, { [styles.asidePanelHidden]: !isEditorPanelOPened() })}
      >
        <div>
          <Button
            value={<Icon name="close" />}
            variant={'inline'}
            class={styles.close}
            onClick={toggleEditorPanel}
          />
        </div>

        <section>
          <Button value={t('Publish')} variant={'inline'} class={styles.button} />
          <Button value={t('Save draft')} variant={'inline'} class={styles.button} />
        </section>

        <section>
          <Button
            value={
              <>
                <Icon name="eye" class={styles.icon} />
                {t('Preview')}
              </>
            }
            variant={'inline'}
            class={clsx(styles.button, styles.buttonWithIcon)}
          />
          <Button
            value={
              <>
                <Icon name="pencil-outline" class={styles.icon} />
                {t('Editing')}
              </>
            }
            variant={'inline'}
            class={clsx(styles.button, styles.buttonWithIcon)}
          />
          <Button
            value={
              <>
                <Icon name="feed-discussion" class={styles.icon} />
                {t('FAQ')}
              </>
            }
            variant={'inline'}
            class={clsx(styles.button, styles.buttonWithIcon)}
          />
        </section>

        <section>
          <Button value={t('Invite co-authors')} variant={'inline'} class={styles.button} />
          <Button value={t('Publication settings')} variant={'inline'} class={styles.button} />
          <Button value={t('Corrections history')} variant={'inline'} class={styles.button} />
        </section>

        <section>
          <p>
            <a href="/how-to-write-a-good-article">Как написать хорошую статью</a>
          </p>
          <p>
            <a href="#">Горячие клавиши</a>
          </p>
          <p>
            <a href="#">Помощь</a>
          </p>
        </section>

        <div class={styles.stats}>
          <div>
            Знаков: <em>2345</em>
          </div>
          <div>
            Слов: <em>215</em>
          </div>
          <div>
            Абзацев: <em>300</em>
          </div>
          <div>
            Посл. изм.: <em>22.03.22 в 18:20</em>
          </div>
        </div>
      </aside>
    </>
  )
}

export default CreateView

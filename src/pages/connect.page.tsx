import { PageLayout } from '../components/_shared/PageLayout'
import { createSignal, Show } from 'solid-js'

export const ConnectPage = () => {
  const [state, setState] = createSignal<'initial' | 'loading' | 'success' | 'error'>('initial')

  const formRef: { current: HTMLFormElement } = { current: null }
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setState('loading')

    // eslint-disable-next-line unicorn/prefer-spread
    const postData = Array.from(formRef.current.elements).reduce(
      (acc, element) => {
        const formField = element as unknown as { name: string; value: string }
        if (formField.name) {
          acc[formField.name] = formField.value
        }

        return acc
      },
      {} as Record<string, string>
    )

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    }

    const result = await fetch('/api/feedback', requestOptions)

    if (!result.ok) {
      console.error('[handleFormSubmit]', result)
      setState('error')
      return
    }

    setState('success')
    window.scrollTo({
      top: 0
    })
  }

  // TODO: l10n
  return (
    <PageLayout title="Предложить идею">
      <article class="wide-container container--static-page">
        <div class="row">
          <div class="col-sm-20 col-md-16 col-lg-14 col-xl-12 offset-md-5">
            <Show when={state() === 'loading' || state() === 'initial' || state() === 'error'}>
              <h1>
                <span class="wrapped">Предложить идею</span>
              </h1>

              <p>
                Хотите что-то предложить, обсудить или посоветовать? Поделиться темой или идеей? Напишите
                нам скорее! Если укажете свою почту, мы&nbsp;обязательно ответим.
              </p>

              <form onSubmit={handleFormSubmit} ref={(el) => (formRef.current = el)}>
                <div class="pretty-form__item">
                  <select name="subject" disabled={state() === 'loading'}>
                    <option value="Сотрудничество" selected>
                      Сотрудничество
                    </option>
                    <option value="Посоветовать тему">Посоветовать тему</option>
                    <option value="Сообщить об ошибке">Сообщить об ошибке</option>
                    <option value="Предложить проект">Предложить проект</option>
                    <option value="Волонтерство">Волонтерство</option>
                    <option value="Другое">Другое</option>
                  </select>
                </div>
                <div class="pretty-form__item">
                  <input
                    type="email"
                    name="contact"
                    placeholder="Email для обратной связи"
                    disabled={state() === 'loading'}
                  />
                  <label for="contact-email">Email для обратной связи</label>
                </div>
                <div class="pretty-form__item">
                  <textarea name="message" placeholder="Текст сообщения" disabled={state() === 'loading'} />
                  <label for="message">Текст сообщения</label>
                </div>
                <button class="button" disabled={state() === 'loading'} type="submit">
                  Отправить письмо
                </button>
              </form>
            </Show>
            <Show when={state() === 'error'}>
              <br />
              Ошибка. Что-то пошло не так. Пожалуйста, попробуйте написать ещё раз
            </Show>
            <Show when={state() === 'success'}>Спасибо за письмо!</Show>
          </div>
        </div>
      </article>
    </PageLayout>
  )
}

export const Page = ConnectPage

import { MainLayout } from '../Layouts/MainLayout'

export const ConnectPage = () => {
  return (
    <MainLayout>
      <article class="container container--static-page">
        <div class="row">
          <h1 class="col-md-8 offset-md-2">
            <span class="wrapped">Предложить идею</span>
          </h1>
          <div class="col-md-8 col-lg-6 offset-md-3">
            <p>
              Хотите что-то предложить, обсудить или посоветовать? Поделиться темой или идеей? Напишите нам
              скорее! Если укажете свою почту, мы&nbsp;обязательно ответим.
            </p>

            <form action=".">
              <div class="pretty-form__item">
                <select id="subject">
                  <option value="">Сотрудничество</option>
                  <option value="">Посоветовать тему</option>
                  <option value="">Сообщить об ошибке</option>
                  <option value="">Предложить проект</option>
                  <option value="">Волонтерство</option>
                  <option value="">Другое</option>
                </select>
              </div>
              <div class="pretty-form__item">
                <input type="text" id="contact-email" placeholder="Email для обратной связи" />
                <label for="contact-email">Email для обратной связи</label>
              </div>
              <div class="pretty-form__item">
                <textarea id="message" placeholder="Текст сообщения" />
                <label for="message">Текст сообщения</label>
              </div>
              <button class="button">Отправить письмо</button>
            </form>
          </div>
        </div>
      </article>
    </MainLayout>
  )
}

export default ConnectPage

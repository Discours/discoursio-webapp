import { MainLayout } from '../../Layouts/MainLayout'
import { t } from '../../../utils/intl'

export const ThanksPage = () => {
  const title = t('Thank you')
  return (
    <MainLayout>
      {/*<Meta name="description" content={title} />*/}
      {/*<Meta name="keywords" content={`Discours.io, ${title}, ${t('Thank you', 'en')}`} />*/}
      {/*<Meta property="og:title" content={title} />*/}
      {/*<Meta property="og:description" content={title} />*/}

      <article class="container container--static-page">
        <div class="row">
          <div class="col-md-8 offset-md-2">
            <h1>
              <span class="wrapped">{title}</span>
            </h1>
          </div>
          <div class="col-md-8 col-lg-6 offset-md-3">
            {/*
                <h3><b>Команда</b></h3>
                  <p>
                    Константин Ворович — исполнительный директор,
                    <a href="mailto:welcome@discours.io" target="_blank"
                      >welcome@discours.io</a
                    ><br />
                    Александр Гусев — технический архитектор,
                    <a href="mailto:services@discours.io" target="_blank"
                      >services@discours.io</a
                    ><br />
                    Екатерина Ильина — шеф-редактор проекта,
                    <a href="mailto:letter@discours.io" target="_blank"
                      >letter@discours.io</a
                    ><br />
                    Яна Климова — редактор сайта и соцсетей,
                    <a href="mailto:letter@discours.io" target="_blank"
                      >letter@discours.io</a
                    ><br />
                    Николай Носачевский — голос и душа подкаста,
                    <a href="mailto:podcast@discours.io" target="_blank"
                      >podcast@discours.io</a
                    >
                  </p>
  */}
            <h3>Неоценимый вклад в&nbsp;Дискурс внесли и&nbsp;вносят</h3>
            <p>
              Мария Бессмертная, Дамир Бикчурин, Константин Ворович, Ян&nbsp;Выговский, Эльдар Гариффулин,
              Павел Гафаров, Виктория Гендлина, Александр Гусев, Данила Давыдов, Константин Дубовик,
              Вячеслав Еременко, Кристина Ибрагим, Екатерина Ильина, Анна Капаева, Яна Климова, Александр
              Коренков, Ирэна Лесневская, Игорь Лобанов, Анастасия Лозовая, Григорий Ломизе, Евгений
              Медведев, Павел Никулин, Николай Носачевский, Андрей Орловский, Михаил Панин, Антон Панов,
              Павел Пепперштейн, Любовь Покровская, Илья Розовский, Денис Светличный, Павел Соколов, Сергей
              Стрельников, Глеб Струнников, Николай Тарковский, Кирилл Филимонов, Алексей Хапов, Екатерина
              Харитонова
            </p>
            <h3>Авторы</h3>
            <p>
              Мы&nbsp;безмерно благодарны{' '}
              <a href="/authors" target="_blank" rel="noopener noreferrer">
                каждому автору
              </a>{' '}
              за&nbsp;участие и&nbsp;поддержку проекта. Сегодня, когда для большинства деньги стали целью
              и&nbsp;основным источником мотивации, бескорыстная помощь и&nbsp;основанный на&nbsp;энтузиазме
              труд бесценны. Именно вы&nbsp;своим трудом каждый день делаете Дискурс таким, какой
              он&nbsp;есть.
            </p>
            <h3>Иллюстраторы</h3>
            <p>
              Ольга Аверинова, Регина Акчурина, Айгуль Берхеева, Екатерина Вакуленко, Анастасия Викулова,
              Мария Власенко, Ванесса Гаврилова, Ольга Горше, Ксения Горшкова, Ангелина Гребенюкова, Илья
              Diliago, Антон Жаголкин, Саша Керова, Ольга Машинец, Злата Мечетина, Тала Никитина, Никита
              Поздняков, Матвей Сапегин, Татьяна Сафонова, Виктория Шибаева
            </p>
            <h3>Меценаты</h3>
            <p>
              Дискурс существует исключительно на&nbsp;пожертвования читателей. Мы&nbsp;бесконечно
              признательны всем, кто нас поддерживает. Ваши пожертвования&nbsp;&mdash; финансовый фундамент
              журнала. Благодаря вам мы&nbsp;развиваем платформу качественной журналистики, которая помогает
              самым разным авторам быть услышанными. Стать нашим меценатом и&nbsp;подписаться
              на&nbsp;ежемесячную поддержку проекта можно{' '}
              <a href="/about/help" target="_self">
                здесь
              </a>
              .
            </p>
          </div>
        </div>
      </article>
    </MainLayout>
  )
}

// for lazy loading
export default ThanksPage

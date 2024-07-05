import { Meta } from '@solidjs/meta'
import { StaticPage } from '~/components/Views/StaticPage'
import { useLocalize } from '~/context/localize'
import { getImageUrl } from '~/utils/getImageUrl'

export const ThanksPage = () => {
  const { t } = useLocalize()
  const ogImage = getImageUrl('production/image/logo_image.png')
  const ogTitle = t('Thank you')
  const description = t(
    'Self-publishing exists thanks to the help of wonderful people from all over the world. Thank you!'
  )

  return (
    <StaticPage title={ogTitle}>
      <Meta name="descprition" content={description} />
      <Meta name="keywords" content={t('keywords')} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="og:description" content={description} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle} />
      <Meta name="twitter:description" content={description} />

      <h1>
        <span class="wrapped">{ogTitle}</span>
      </h1>
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
        Мария Бессмертная, Дамир Бикчурин, Константин Ворович, Ян&nbsp;Выговский, Эльдар Гариффулин, Павел
        Гафаров, Виктория Гендлина, Александр Гусев, Данила Давыдов, Константин Дубовик, Вячеслав Еременко,
        Кристина Ибрагим, Екатерина Ильина, Анна Капаева, Яна Климова, Александр Коренков, Ирэна Лесневская,
        Игорь Лобанов, Анастасия Лозовая, Григорий Ломизе, Евгений Медведев, Павел Никулин, Николай
        Носачевский, Андрей Орловский, Михаил Панин, Антон Панов, Павел Пепперштейн, Любовь Покровская, Илья
        Розовский, Денис Светличный, Павел Соколов, Сергей Стрельников, Глеб Струнников, Николай Тарковский,
        Кирилл Филимонов, Алексей Хапов, Екатерина Харитонова
      </p>
      <h3>Авторы</h3>
      <p>
        Мы&nbsp;безмерно благодарны{' '}
        <a href="/author" target="_blank" rel="noopener noreferrer">
          каждому автору
        </a>{' '}
        за&nbsp;участие и&nbsp;поддержку проекта. Сегодня, когда для большинства деньги стали целью
        и&nbsp;основным источником мотивации, бескорыстная помощь и&nbsp;основанный на&nbsp;энтузиазме труд
        бесценны. Именно вы&nbsp;своим трудом каждый день делаете Дискурс таким, какой он&nbsp;есть.
      </p>
      <h3>Иллюстраторы</h3>
      <p>
        Ольга Аверинова, Регина Акчурина, Айгуль Берхеева, Екатерина Вакуленко, Анастасия Викулова, Мария
        Власенко, Ванесса Гаврилова, Ольга Горше, Ксения Горшкова, Ангелина Гребенюкова, Илья Diliago, Антон
        Жаголкин, Саша Керова, Ольга Машинец, Злата Мечетина, Тала Никитина, Никита Поздняков, Матвей
        Сапегин, Татьяна Сафонова, Виктория Шибаева
      </p>
      <h3>Меценаты</h3>
      <p>
        Дискурс существует исключительно на&nbsp;пожертвования читателей. Мы&nbsp;бесконечно признательны
        всем, кто нас поддерживает. Ваши пожертвования&nbsp;&mdash; финансовый фундамент журнала. Благодаря
        вам мы&nbsp;развиваем платформу качественной журналистики, которая помогает самым разным авторам
        быть услышанными. Стать нашим меценатом и&nbsp;подписаться на&nbsp;ежемесячную поддержку проекта
        можно <a href="/support">здесь</a>.
      </p>
    </StaticPage>
  )
}

export default ThanksPage

import { PageWrap } from '../../_shared/PageWrap'
import { t } from '../../../utils/intl'

export const DiscussionRulesPage = () => {
  const title = t('Discussion rules')
  return (
    <PageWrap>
      <article class="wide-container container--static-page">
        <div class="row">
          <div class="col-md-6 col-xl-7 shift-content order-md-first">
            <h1>
              <span class="wrapped" innerHTML={title} />
            </h1>

            <p>
              Открытая редакция существует благодаря дружному сообществу авторов
              и&nbsp;читателей&nbsp;&mdash; вдумчивых и&nbsp;сознательных людей, приверженных ценностям
              гуманизма, демократии и&nbsp;прав человека. Мы&nbsp;очень ценим атмосферу осмысленного
              общения, которая здесь сложилась. Чтобы сохранить ее&nbsp;такой&nbsp;же уютной
              и&nbsp;творческой, мы&nbsp;составили правила общения в&nbsp;сообществе, руководствуясь
              которыми каждый мог&nbsp;бы соучаствовать в&nbsp;плодотворных дискуссиях, не&nbsp;задевая
              других. Ключевой принцип этих правил предельно прост&nbsp;&mdash; уважайте ближних,
              постарайтесь не&nbsp;нарушать законы Российской Федерации без крайней
              на&nbsp;то&nbsp;необходимости и&nbsp;помните, что в&nbsp;дискуссиях чутких
              и&nbsp;здравомыслящих людей рождается истина.
            </p>

            <h3>За&nbsp;что можно получить дырку в&nbsp;карме и&nbsp;выиграть бан в&nbsp;сообществе</h3>
            <ol>
              <li>
                <p>
                  Оскорбления, личные нападки, травля и&nbsp;угрозы. В&nbsp;любом виде. Конкретного человека
                  или социальной группы&nbsp;&mdash; не&nbsp;суть. Агрессия, переход на&nbsp;личности
                  и&nbsp;токсичность едва&nbsp;ли способствуют плодотворному общению.
                </p>
              </li>

              <li>
                <p>
                  Шовинизм, расизм, сексизм, гомофобия, пропаганда ненависти, педофилии, суицида,
                  распространение детской порнографии и&nbsp;другого человеконенавистнического контента.
                </p>
              </li>

              <li>
                <p>
                  Спам, реклама, фейкньюз, ссылки на&nbsp;пропагандистские СМИ, вбросы дезинформации,
                  специально уводящий от&nbsp;темы флуд, провокации, разжигание конфликтов, намеренный срыв
                  дискуссий.
                </p>
              </li>

              <li>
                <p>
                  Неаргументированная критика и&nbsp;комментарии вроде &laquo;отстой&raquo;, &laquo;зачем
                  я&nbsp;это увидел/а&raquo;, &laquo;не&nbsp;читал, но&nbsp;осуждаю&raquo;, &laquo;либераху
                  порвало&raquo;, &laquo;лол&raquo;, &laquo;скатились&raquo;, &laquo;первый нах&raquo;
                  и&nbsp;тому подобные. Односложные реплики не&nbsp;подразумевают возможность обогащающего
                  диалога, не&nbsp;продуктивны и&nbsp;никак не&nbsp;помогают авторам делать материалы лучше,
                  а&nbsp;читателям&nbsp;&mdash; разобраться.
                </p>
              </li>
            </ol>

            <h3>За&nbsp;что можно получить лучи добра и&nbsp;благодарности в&nbsp;сообществе</h3>
            <ol>
              <li>
                <p>
                  <strong>Вежливость и&nbsp;конструктивность.</strong> Мы&nbsp;выступаем
                  за&nbsp;конструктивный диалог, аргументированные комментарии и&nbsp;доброжелательное
                  отношение друг к&nbsp;другу. Задавайте содержательные вопросы, пишите развернутые
                  комментарии, подкрепляйте их&nbsp;аргументами, чтобы диалог был полезен всем участникам,
                  помогая глубже понять тему и&nbsp;разобраться в&nbsp;вопросе. И, пожалуйста, уважайте
                  собеседника, даже если он&nbsp;вам лично не&nbsp;импонирует: только так получаются
                  продуктивные дискуссии.
                </p>
              </li>

              <li>
                <p>
                  <strong>Обмен знаниями и&nbsp;историями.</strong> Осмысленные высказывания по&nbsp;теме
                  поста, оригинальные рассуждения, рассказы о&nbsp;личном опыте и&nbsp;проектах, обмен
                  профессиональной экспертизой, наблюдения и&nbsp;реальные истории
                  из&nbsp;жизни&nbsp;&mdash; чем больше мы&nbsp;делимся друг с&nbsp;другом знаниями, тем
                  интереснее и&nbsp;плодотворнее становится наше общение. Помните, что каждый вдумчивый
                  ответ повышает качество дискуссий в&nbsp;сообществе и&nbsp;делает чтение самиздата ещё
                  интереснее.
                </p>
              </li>

              <li>
                <p>
                  <strong>Чувство юмора и&nbsp;добродушие.</strong> Остроумие и&nbsp;дружелюбие
                  не&nbsp;только направляют дискуссии в&nbsp;продуктивное русло, но&nbsp;и&nbsp;улучшают
                  настроение. Не&nbsp;вредите негативом, которого в&nbsp;интернете и&nbsp;без нас хватает,
                  и&nbsp;не&nbsp;травите на&nbsp;корню классные инициативы&nbsp;&mdash; всё великое
                  начинается с&nbsp;малого. Мы&nbsp;за&nbsp;поддерживающую и&nbsp;вдохновляющую атмосферу
                  в&nbsp;сообществе. Надеемся, вы&nbsp;тоже.
                </p>
              </li>

              <li>
                <p>
                  <strong>Благодарность и&nbsp;поддержка.</strong> Если публикация вам зашла,
                  не&nbsp;стесняйтесь ставить лайки, делиться понравившимися материалами, благодарить
                  авторов, читателей, художников и&nbsp;редакторов в&nbsp;комментариях. Цените
                  и&nbsp;поддерживайте классные проекты, сильные тексты, новое искусство, осмысленные
                  комментарии и&nbsp;вклад других в&nbsp;самиздат&nbsp;&mdash; сотрудничество делает нас
                  сильнее и&nbsp;усиливает звучание идей и&nbsp;смыслов, которые помогают лучше понимать
                  мир.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </article>
    </PageWrap>
  )
}

// for lazy loading
export default DiscussionRulesPage

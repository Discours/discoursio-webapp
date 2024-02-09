import os
import requests

# Получение переменных окружения
MAILGUN_API_KEY = os.environ.get('MAILGUN_API_KEY')
MAILGUN_DOMAIN = os.environ.get('MAILGUN_DOMAIN')


def handler(request):
    # Получение данных из запроса
    req_body = request.get_json()
    contact = req_body.get('contact')
    subject = req_body.get('subject')
    message = req_body.get('message')

    # Формирование текста письма
    text = f"{contact}\n\n{message}"

    # Формирование данных для отправки
    data = {
        'from': 'Discours Feedback Robot <robot@discours.io>',
        'to': 'welcome@discours.io',
        'subject': subject,
        'text': text
    }

    # Отправка письма через Mailgun API
    try:
        assert isinstance(MAILGUN_API_KEY, str), 'no api key'
        response = requests.post(
            f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
            auth=('api', MAILGUN_API_KEY),
            data=data
        )
        response.raise_for_status()
        print('Email sent successfully!', response.text)
        return {'result': 'great success'}, 200
    except Exception as e:
        print('Error:', e)
        return str(e), 400

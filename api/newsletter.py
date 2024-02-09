import os
import requests
from requests.auth import HTTPDigestAuth

# Получение переменных окружения
MAILGUN_API_KEY = os.environ.get('MAILGUN_API_KEY')

def add_email_to_list(request):
    msg = ''
    if MAILGUN_API_KEY:
        # Получение данных из запроса
        req_body = request.get_json()
        email = req_body.get('email')

        # Формирование данных для добавления в список рассылки
        data = {
            'address': email,
            'subscribed': True,
            'upsert': 'yes'
        }

        # Отправка запроса на добавление адреса в список рассылки через Mailgun API
        try:
            response = requests.post(
                'https://api.mailgun.net/v3/lists/newsletter@discours.io/members',
                auth=HTTPDigestAuth('api', MAILGUN_API_KEY),
                data=data
            )
            response.raise_for_status()
            return {
                'success': True,
                'message': 'Email was added to newsletter list',
                'response': response.json()
            }, 200
        except Exception as e:
            print(e)
            msg = str(e)
    return {
        'success': False,
        'message': msg
    }, 400

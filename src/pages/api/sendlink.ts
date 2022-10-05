import Mailgun from 'mailgun.js'
import FormDataPackage from 'form-data'

const domain: string = process.env.MAILGUN_DOMAIN
const key: string = process.env.MAILGUN_API_KEY
const mailgun = new Mailgun(FormDataPackage)
const mg = mailgun.client({
  username: 'api',
  key,
  url: 'https://api.mailgun.net'
})

export type EmailContent = {
  to: string | string[]
  subject: string
  text: string
  html?: string
  from?: string
}

const from = `discours.io <noreply@discours.io>`

export default async function handler(req, res) {
  const { to, subject } = req.query
  const token = '' // FIXME
  const text = 'Follow the link to confirm email: https://new.discours.io/confirm/' + token // TODO: use templates here
  mg.messages
    .create(domain, { to, subject, text, from } as EmailContent)
    .then((_) => res.status(200))
    .catch(console.error)
}

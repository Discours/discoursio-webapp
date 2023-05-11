const { formidablePromise } = require('./_shared/formidablePromise')
const mailgun = require('mailgun.js')
const FormData = require('form-data')

const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env

const mg = mailgun.client({ username: 'discoursio', key: MAILGUN_API_KEY })

export default async function handler(req, res) {
  const { contact, subject, message } = await formidablePromise(req)

  const text = `${contact}\n\n${message}`

  const form = new FormData()
  form.append('from', 'Discours Feedback Robot <robot@discours.io>')
  form.append('to', 'welcome@discours.io')
  form.append('subject', subject)
  form.append('text', text)

  try {
    const response = await mg.messages.create(MAILGUN_DOMAIN, { form })
    console.log('Email sent successfully!', response)
    res.status(200).json({ result: 'great success' })
  } catch (error) {
    console.log('Error:', error)
    res.status(400).json(error)
  }
}

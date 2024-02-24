const formData = require('form-data')
const Mailgun = require('mailgun.js')

const mailgun = new Mailgun(formData)

const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env
const mg = mailgun.client({ username: 'discoursio', key: MAILGUN_API_KEY })

export default async function handler(req, res) {
  const { contact, subject, message } = req.body

  const text = `${contact}\n\n${message}`

  const data = {
    from: 'Discours Feedback Robot <robot@discours.io>',
    to: 'welcome@discours.io',
    subject,
    text
  }

  try {
    const response = await mg.messages.create(MAILGUN_DOMAIN, data)
    console.log('Email sent successfully!', response)
    res.status(200).json({ result: 'great success' })
  } catch (error) {
    console.log('Error:', error)
    res.status(400).json(error)
  }
}

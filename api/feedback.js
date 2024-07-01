import FormData from 'form-data'
import Mailgun from 'mailgun.js'

const mailgun = new Mailgun(FormData)
const mg = mailgun.client({ username: 'discoursio', key: process.env.MAILGUN_API_KEY })

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
    const response = await mg.messages.create('discours.io', data)
    console.log('Email sent successfully!', response)
    res.status(200).json({ result: 'great success' })
  } catch (error) {
    console.log('Error:', error)
    res.status(400).json(error)
  }
}

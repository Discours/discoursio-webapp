import { formidablePromise } from './_shared/formidablePromise'
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})

export default async function handler(req, res) {
  const { contact, subject, message } = await formidablePromise(req)

  const text = `${contact}\n\n${message}`

  const data = {
    from: 'Discours Feedback Robot <robot@discours.io>',
    to: 'welcome@discours.io',
    subject,
    text
  }

  mailgun.messages().send(data, (error) => {
    if (error) {
      console.log('Error:', error)
      res.status(400).json(error)
    } else {
      console.log('Email sent successfully!')
      res.status(200)
    }
  })
}

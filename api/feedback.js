const MG = require('mailgun.js')
const fd = require('form-data')

const mgOptions = {
  key: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  username: 'discoursio' // FIXME
}

const messageData = (subject, text) => {
  return {
    from: 'Discours Feedback Robot <robot@discours.io>',
    to: 'welcome@discours.io',
    subject,
    text
  }
}
export default async function handler(req, res) {
  const { contact, subject, message } = req.query
  try {
    const mailgun = new MG(fd)
    const client = mailgun.client(mgOptions)
    const data = messageData(`${contact}: ${subject}`, message)
    client.messages.create(mgOptions.domain, data).then(console.log).catch(console.error)
  } catch (error) {
    res.status(400).json(error)
  }
}

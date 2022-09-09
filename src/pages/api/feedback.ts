import MG from 'mailgun.js'
import fd from 'form-data'
import type Options from 'mailgun.js/interfaces/Options'

const mgOptions = {
  key: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  username: 'discoursio' // FIXME
}

const messageData = (subject, text) => {
  return {
    from: 'Feedback Robot <robot@discours.io>',
    to: 'welcome@discours.io',
    subject,
    text
  }
}
export default async function handler(req, res) {
  const { contact, subject, message } = req.query
  try {
    const mailgun = new MG(fd)
    const client = mailgun.client({
      username: mgOptions.username,
      key: mgOptions.key
      //url?: string;
      //public_key?: string;
    } as Options)
    const data = messageData(`${contact}: ${subject}`, message)
    client.messages.create(mgOptions.domain, data).then(console.log).catch(console.error)
  } catch (error) {
    res.status(400).json(error)
  }
}

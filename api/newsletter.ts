/* eslint-disable unicorn/no-empty-file */
/*
import MG from 'mailgun.js'

const mailgun = new MG({})
const options = {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
}
const list = mailgun.lists(process.env.MAILGUN_LIST_ID) // 'services@discours.io'

export default async function handler(req, res) {
  const { email } = req.body.data
  list.members().create({ subscribed: true, address: email }, (err, data) => {
    if (err) {
      console.error('[newsletter ] error', err)
      res.status(500)
    } else {
      res.status(200).json(data)
    }
  })
}
*/

export const handler = (req, res) => {
  return 'WIP'
}

const MG = require('mailgun.js')
const fd = require('form-data')
const mailgun = new MG(fd)

const mgOptions = {
  key: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  username: 'discoursio' // FIXME
}

const client = mailgun.client(mgOptions)

export default async (req, res) => {
  const { email } = req.query

  try {
    const response = await client.lists.members.createMember(mgOptions.domain, {
      address: email,
      subscribed: true,
      upsert: 'yes'
    })

    return res.status(200).json({
      success: true,
      message: 'Email was added to newsletter list',
      response: JSON.stringify(response)
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

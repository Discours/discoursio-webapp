import MG from 'mailgun.js'
import fd from 'form-data'

const mgOptions = {
  key: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  username: 'discoursio' // FIXME
}

export default async (req, res) => {
  const { email } = req.query
  const mailgun = new MG(fd)
  const client = mailgun.client(mgOptions)

  try {
    const response = await client.lists.members.createMember(mgOptions.domain, {
      address: email,
      subscribed: true,
      upsert: 'yes'
    })

    return res.status(200).json({
      success: true,
      message: 'Email added to newsletter list'
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

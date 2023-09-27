const formData = require('form-data')
const Mailgun = require('mailgun.js')

const mailgun = new Mailgun(formData)

const { MAILGUN_API_KEY } = process.env
const mg = mailgun.client({ username: 'discoursio', key: MAILGUN_API_KEY })

export default async (req, res) => {
  const { email } = req.body

  try {
    const response = await mg.lists.members.createMember('newsletter@discours.io', {
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

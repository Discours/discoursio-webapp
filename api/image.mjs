import fetch from 'node-fetch'

export default async function handler(req, res) {
  const imageUrl = req.query.url

  if (!imageUrl) {
    return res.status(400).send('Missing URL parameter')
  }

  try {
    const imageRes = await fetch(imageUrl)

    if (!imageRes.ok) {
      return res.status(404).send('Image not found')
    }

    res.setHeader('Content-Type', imageRes.headers.get('content-type'))

    imageRes.body.pipe(res)
  } catch (err) {
    console.error(err)
    return res.status(404).send('Error')
  }
}

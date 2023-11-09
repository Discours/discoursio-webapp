import { renderPage } from 'vike/server'

export default async function handler(req, res) {
  const { url, cookies } = req

  const pageContext = await renderPage({ urlOriginal: url, cookies })

  const { httpResponse, errorWhileRendering, is404 } = pageContext

  if (errorWhileRendering && !is404) {
    console.error(errorWhileRendering)
    res.statusCode = 500
    res.end()
    return
  }

  if (!httpResponse) {
    res.statusCode = 200
    res.end()
    return
  }

  const { body, statusCode, contentType } = httpResponse
  res.statusCode = statusCode
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  res.end(body)
}

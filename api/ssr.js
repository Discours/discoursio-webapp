import { renderPage } from 'vite-plugin-ssr/server'

export default async function handler(req, res) {
  const { url, cookies } = req

  const pageContext = await renderPage({ urlOriginal: url, cookies })

  const { httpResponse } = pageContext

  if (!httpResponse) {
    console.log('!!!')
    console.log(pageContext)
    console.log('!!!')
    res.statusCode = 200
    res.end()
    return
  }

  const { body, statusCode, contentType } = httpResponse
  res.statusCode = statusCode
  res.setHeader('Content-Type', contentType)
  res.end(body)
}

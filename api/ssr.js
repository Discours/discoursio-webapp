const { renderPage } = require('vite-plugin-ssr/dist/cjs/node/runtime/renderPage')

export default async function handler(req, res) {
  const { url, cookies } = req

  const pageContext = await renderPage({ urlOriginal: url, cookies })

  const { httpResponse, errorWhileRendering } = pageContext

  if (errorWhileRendering) {
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
  res.end(body)
}

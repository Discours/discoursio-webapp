import { renderPage } from 'vike/server'

// We use JSDoc instead of TypeScript because Vercel seems buggy with /api/**/*.ts files

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  const { url, cookies } = request
  const pageContext = await renderPage({ urlOriginal: url, cookies })
  const { httpResponse, errorWhileRendering, is404 } = pageContext

  if (is404) {
    return new Response('', { status: 404 })
  }

  if (errorWhileRendering) {
    console.error(errorWhileRendering)
    return new Response('', { status: 500 })
  }

  if(!httpResponse) {
    return new Response('', { status: 200 })
  }

  const { body, statusCode, headers: headersArray } = httpResponse
  const res = new Response()
  const headers = headersArray.reduce((acc, [name, value]) => {
    acc[name] = value
    return acc
  }, {})

  headers['Cache-Control'] = 's-maxage=1, stale-while-revalidate'

  res.statusCode = statusCode
  res.headers = headers
  res.end(body)
}

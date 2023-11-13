import { renderPage } from 'vike/server'

// export const config = {
//   runtime: 'edge'
// }
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

  const { body, statusCode, headers } = httpResponse

  console.log('headers:', JSON.stringify(headers))
  console.log('headers[0]:', JSON.stringify(headers[0]))

  res.statusCode = statusCode
  res.setHeader('Content-Type', headers['Content-Type'])
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.end(body)
}

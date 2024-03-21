import { renderPage } from 'vike/server'

export const config = {
  runtime: 'edge',
}
export default async function handler(request, _response) {
  const { url, cookies } = request

  const pageContext = await renderPage({ urlOriginal: url, cookies })

  const { httpResponse, errorWhileRendering, is404 } = pageContext

  if (errorWhileRendering && !is404) {
    console.error(errorWhileRendering)
    return new Response('', { status: 500 })
  }

  if (!httpResponse) {
    return new Response()
  }

  const { body, statusCode, headers: headersArray } = httpResponse

  const headers = headersArray.reduce((acc, [name, value]) => {
    acc[name] = value
    return acc
  }, {})

  headers['Cache-Control'] = 's-maxage=1, stale-while-revalidate'

  return new Response(body, { status: statusCode, headers })
}

// /:slug -> /@slug
// https://vite-plugin-ssr.com/routing
// https://www.npmjs.com/package/@nanostores/router
export const getServerRoute = (clientRoute: string) => clientRoute.replaceAll(':', '@')

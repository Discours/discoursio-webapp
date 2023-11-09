// /:slug -> /@slug
// https://vike.dev/routing
// https://www.npmjs.com/package/@nanostores/router
export const getServerRoute = (clientRoute: string) => clientRoute.replaceAll(':', '@')
